import { Worker, Queue } from "bullmq";
import Redis from "ioredis";
import { db } from "@/db";
import { bookmarks } from "@/db/schema";
import { eq } from "drizzle-orm";

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", { maxRetriesPerRequest: null, enableReadyCheck: false });

export const checkerWorker = new Worker("broken-links", async (job) => {
  if (job.name === "check-all") {
    console.log("Running periodic broken link check on all bookmarks...");

    const allBookmarks = await db.select().from(bookmarks);

    for (const bookmark of allBookmarks) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(bookmark.url, {
          method: "HEAD",
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn(`[Broken Link]: Bookmark ID ${bookmark.id} returned status ${response.status} for URL ${bookmark.url}`);
          // We could optionally tag it as broken in DB, but for now just logging as per simple spec
        } else {
          console.log(`[OK]: Bookmark ID ${bookmark.id} returned status ${response.status} for URL ${bookmark.url}`);
        }
      } catch (error) {
        console.error(`[Broken Link/Error]: Bookmark ID ${bookmark.id} failed to fetch URL ${bookmark.url}. Error:`, error);
      }
    }
    console.log("Finished broken link check.");
  }
}, { connection });
