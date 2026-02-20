import "dotenv/config";
import mongoose from "mongoose";
import { Worker } from "bullmq";
import { v4 as uuidv4 } from "uuid";
import IORedis from "ioredis";
import pino from "pino";

import Document from "./models/Document.js";
import { extractPages } from "./services/pdfExtract.js";
import { chunkText } from "./services/chunker.js";
import { embedBatch } from "./services/openai.js";
import { ensureQdrantCollection, qdrant } from "./services/qdrant.js";
import { publishAdminEvent } from "./events/publisher.js";

const logger = pino({ level: "info" });

const redisConn = new IORedis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  maxRetriesPerRequest: null,
});

const COLLECTION = process.env.QDRANT_COLLECTION;
const BATCH_SIZE = 64; // keep small for 2-core VPS

async function updateDoc(documentId, patch) {
  await Document.updateOne({ _id: documentId }, { $set: patch });
  const doc = await Document.findById(documentId).lean();

  // publish progress for Admin SSE/list
  await publishAdminEvent({
    type: "doc.progress",
    documentId,
    status: doc?.status,
    progress: doc?.progress,
    updatedAt: doc?.updatedAt,
  });
}

async function markFailed(documentId, error) {
  await updateDoc(documentId, {
    status: "failed",
    progress: { stage: "failed" },
    errorMessage: error?.message || String(error),
  });

  await publishAdminEvent({
    type: "doc.failed",
    documentId,
    error: error?.message || String(error),
    updatedAt: new Date().toISOString(),
  });
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  await ensureQdrantCollection();

  logger.info("✅ Worker ready (connected to MongoDB, Redis, Qdrant)");

  new Worker(
    "doc.ingest",
    async (job) => {
      const { documentId } = job.data;
      logger.info({ documentId, jobId: job.id }, "📥 Ingest job started");

      const doc = await Document.findById(documentId).lean();
      if (!doc) throw new Error("Document not found in MongoDB");

      await updateDoc(documentId, {
        status: "processing",
        progress: { stage: "extract", pagesDone: 0, chunksDone: 0 },
        errorMessage: "",
      });

      let pagesDone = 0;
      let chunksDone = 0;

      let bufferTexts = [];
      let bufferPayloads = [];

      // extract page-by-page
      for await (const { pageNo, text } of extractPages(doc.storagePath)) {
        pagesDone++;

        const chunks = chunkText(text);
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];

          bufferTexts.push(chunk);
          bufferPayloads.push({
            documentId,
            category: doc.category || "all",
            state: doc.state || "",
            district: doc.district || "",
            pageNo,
            chunkIndex: i,
            text: chunk, // keep text here for easy retrieval
          });

          if (bufferTexts.length >= BATCH_SIZE) {
            const vectors = await embedBatch(bufferTexts);

            const points = vectors.map((vec, idx) => ({
              id: uuidv4(),
              vector: vec,
              payload: bufferPayloads[idx],
            }));

            await qdrant.upsert(COLLECTION, { wait: true, points });

            chunksDone += bufferTexts.length;
            bufferTexts = [];
            bufferPayloads = [];

            await updateDoc(documentId, {
              progress: { stage: "embed+upsert", pagesDone, chunksDone },
            });
          }
        }
      }

      // flush leftover batch
      if (bufferTexts.length) {
        const vectors = await embedBatch(bufferTexts);
        const points = vectors.map((vec, idx) => ({
          id: uuidv4(),
          vector: vec,
          payload: bufferPayloads[idx],
        }));
        await qdrant.upsert(COLLECTION, { wait: true, points });
        chunksDone += bufferTexts.length;
      }

      await updateDoc(documentId, {
        status: "ready",
        progress: { stage: "done", pagesDone, chunksDone },
        errorMessage: "",
      });

      await publishAdminEvent({
        type: "doc.ready",
        documentId,
        status: "ready",
        progress: { stage: "done", pagesDone, chunksDone },
        updatedAt: new Date().toISOString(),
      });

      logger.info({ documentId, pagesDone, chunksDone }, "✅ Ingest completed");
      return { pagesDone, chunksDone };
    },
    { connection: redisConn, concurrency: 1 }, // good for MVP; increase later with more CPU
  ).on("failed", async (job, err) => {
    const documentId = job?.data?.documentId;
    logger.error({ documentId, err }, "❌ Job failed");
    if (documentId) await markFailed(documentId, err);
  });
}

run().catch((e) => {
  logger.error(e, "Worker crashed");
  process.exit(1);
});
