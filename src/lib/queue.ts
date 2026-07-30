import { Queue } from "bullmq";
import Redis from "ioredis";

const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379", { maxRetriesPerRequest: null, enableReadyCheck: false });//const connection = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export const bookmarkQueue = new Queue("bookmark-metadata", { connection });

export async function enqueueMetadataExtraction(url: string, bookmarkId: number) {
  await bookmarkQueue.add("extract-metadata", { url, bookmarkId });
}
