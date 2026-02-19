import { Queue } from "bullmq";
import { redis } from "./redis.js";

export const ingestQueue = new Queue("doc.ingest", { connection: redis });
