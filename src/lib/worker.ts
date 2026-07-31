import { Worker } from "bullmq";
import Redis from "ioredis";
import { db } from "@/db";
import { bookmarks, bookmarkArchives, tags, bookmarkTags } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", { maxRetriesPerRequest: null, enableReadyCheck: false });//const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

const PUBLIC_DIR = path.join(process.cwd(), "public");
const ARCHIVE_DIR = path.join(PUBLIC_DIR, "archives");

// Ensure archive directory exists
if (!fs.existsSync(ARCHIVE_DIR)) {
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
}

async function extractMetadata(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('meta[property="og:title"]').attr('content') || $('title').text() || '';
    const description = $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || '';
    const imageUrl = $('meta[property="og:image"]').attr('content') || '';
    const ogType = $('meta[property="og:type"]').attr('content') || '';
    const themeColor = $('meta[name="theme-color"]').attr('content') || '';
    const siteName = $('meta[property="og:site_name"]').attr('content') || '';

    // Very basic price scraping heuristics
    const priceText = $('span[class*="price"], div[class*="price"], .a-price-whole').first().text().trim();
    const priceMatch = priceText.match(/(\$|€|£|¥)\s*\d+(?:,\d{3})*(?:\.\d{2})?/);
    const price = priceMatch ? priceMatch[0] : null;

    let contentType = 'link';
    if (url.includes('youtube.com') || url.includes('youtu.be') || ogType.includes('video')) {
      contentType = 'video';
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
      contentType = 'twitter';
    } else if (url.includes('amazon.com') || ogType.includes('product') || price) {
      contentType = 'product';
    } else if (imageUrl.length > 0 && html.includes('<article')) {
      contentType = 'article';
    } else if (url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) != null) {
      contentType = 'image';
    }

    return { title, description, imageUrl, contentType, themeColor, siteName, price };
  } catch (e) {
    console.error("Failed to extract metadata for URL:", url, e);
    return { title: "", description: "", imageUrl: "", contentType: "link", themeColor: "", siteName: "", price: null };
  }
}

// Helper function to extract tags from text
function extractTags(text: string): string[] {
  if (!text) return [];
  // Basic keyword extraction: remove punctuation, lowercase, split by space, filter common words and short words
  const words = text.replace(/[^\w\s]/g, '').toLowerCase().split(/\s+/);
  const stopWords = new Set(['the', 'and', 'is', 'in', 'to', 'of', 'it', 'for', 'on', 'with', 'as', 'by', 'at', 'an', 'be', 'this', 'that', 'are', 'from', 'or']);
  const tags = words.filter(word => word.length > 3 && !stopWords.has(word));

  // Count frequency and return top 5
  const counts = tags.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(entry => entry[0]);
}

export const worker = new Worker("bookmark-metadata", async (job) => {
  const { url, bookmarkId, userId } = job.data;

  console.log(`Processing metadata extraction for bookmark ${bookmarkId} (${url})`);

  // 1. HTTP Extract
  const { title, description, imageUrl, contentType, themeColor, siteName, price } = await extractMetadata(url);

  // Retrieve existing metadata to preserve collection/tags
  const existingBookmark = await db.select().from(bookmarks).where(eq(bookmarks.id, bookmarkId)).get();
  let metaObj: any = {};
  if (existingBookmark?.metadata) {
    try {
      metaObj = JSON.parse(existingBookmark.metadata);
    } catch(e) {}
  }

  if (themeColor) metaObj.themeColor = themeColor;
  if (siteName) metaObj.siteName = siteName;
  if (price) metaObj.price = price;

  await db.update(bookmarks)
    .set({
      title,
      description,
      imageUrl,
      contentType,
      metadata: JSON.stringify(metaObj)
    })
    .where(eq(bookmarks.id, bookmarkId));

  // 1.5 Extract and assign tags based on title and description
  const combinedText = `${title} ${description}`;
  const generatedTags = extractTags(combinedText);

  if (generatedTags.length > 0 && userId) {
    for (const tagName of generatedTags) {
      // Find or create tag
      let tagRecord = await db.select().from(tags).where(and(eq(tags.name, tagName), eq(tags.userId, userId))).get();

      if (!tagRecord) {
        const [newTag] = await db.insert(tags).values({ name: tagName, userId }).returning();
        tagRecord = newTag;
      }

      if (tagRecord) {
        try {
          await db.insert(bookmarkTags).values({ bookmarkId, tagId: tagRecord.id });
        } catch (e) {
          // Ignore duplicate bookmark_tags constraints
        }
      }
    }
  }

  // 2. Puppeteer Archiving
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: "/usr/bin/chromium-browser",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

    // Screenshot
    const screenshotName = `screenshot_${bookmarkId}_${Date.now()}.jpg`;
    const screenshotPath = path.join(ARCHIVE_DIR, screenshotName);
    await page.screenshot({ path: screenshotPath, fullPage: true, type: "jpeg", quality: 85 });
    await db.insert(bookmarkArchives).values({
      bookmarkId,
      format: "screenshot",
      filePath: `/archives/${screenshotName}`,
    });

    // PDF
    const pdfName = `archive_${bookmarkId}_${Date.now()}.pdf`;
    const pdfPath = path.join(ARCHIVE_DIR, pdfName);
    await page.pdf({ path: pdfPath, printBackground: true });
    await db.insert(bookmarkArchives).values({
      bookmarkId,
      format: "pdf",
      filePath: `/archives/${pdfName}`,
    });

    // Readability
    const html = await page.content();
    const doc = new JSDOM(html, { url });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    if (article?.content) {
      const textName = `readable_${bookmarkId}_${Date.now()}.html`;
      const textPath = path.join(ARCHIVE_DIR, textName);
      fs.writeFileSync(textPath, article.content);
      await db.insert(bookmarkArchives).values({
        bookmarkId,
        format: "readable",
        filePath: `/archives/${textName}`,
      });
    }

  } catch (error) {
    console.error(`Puppeteer archiving failed for bookmark ${bookmarkId}:`, error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  console.log(`Finished processing bookmark ${bookmarkId}`);
}, { connection });
