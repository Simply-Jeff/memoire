import { Worker } from "bullmq";
import Redis from "ioredis";
import { db } from "@/db";
import { bookmarks, bookmarkArchives } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import fs from "fs";
import path from "path";

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

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

    let contentType = 'link';
    if (url.includes('youtube.com') || url.includes('youtu.be') || ogType.includes('video')) {
      contentType = 'video';
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
      contentType = 'twitter';
    } else if (url.includes('amazon.com') || ogType.includes('product')) {
      contentType = 'product';
    } else if (imageUrl.length > 0 && html.includes('<article')) {
      contentType = 'article';
    } else if (url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) != null) {
      contentType = 'image';
    }

    return { title, description, imageUrl, contentType };
  } catch (e) {
    console.error("Failed to extract metadata for URL:", url, e);
    return { title: "", description: "", imageUrl: "", contentType: "link" };
  }
}

export const worker = new Worker("bookmark-metadata", async (job) => {
  const { url, bookmarkId } = job.data;

  console.log(`Processing metadata extraction for bookmark ${bookmarkId} (${url})`);

  // 1. HTTP Extract
  const { title, description, imageUrl, contentType } = await extractMetadata(url);

  await db.update(bookmarks)
    .set({ title, description, imageUrl, contentType })
    .where(eq(bookmarks.id, bookmarkId));

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

    if (article?.textContent) {
      const textName = `readable_${bookmarkId}_${Date.now()}.txt`;
      const textPath = path.join(ARCHIVE_DIR, textName);
      fs.writeFileSync(textPath, article.textContent);
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
