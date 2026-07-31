import { Queue } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", { maxRetriesPerRequest: null, enableReadyCheck: false });//const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export const bookmarkQueue = new Queue("bookmark-metadata", { connection });
export const checkerQueue = new Queue("broken-links", { connection });

export async function enqueueMetadataExtraction(url: string, bookmarkId: number, userId?: string) {
  await bookmarkQueue.add("extract-metadata", { url, bookmarkId, userId });
}

// Optional: add a repeatable job for checking broken links every day (e.g. cron)
export async function scheduleBrokenLinkCheck() {
  await checkerQueue.add("check-all", {}, {
    repeat: {
      pattern: "0 0 * * *" // Run every midnight
    }
  });
}
