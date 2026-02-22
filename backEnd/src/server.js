import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import adminDocumentsRoutes from "./routes/adminDocuments.routes.js";
import chatRoutes from "./routes/chat.routes.js";

import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ingestQueue } from "./queue/ingestQueue.js";

const app = express();

app.use(express.json({ limit: "2mb" })); // login payload only
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true, // IMPORTANT for cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminDocumentsRoutes);

app.use("/api/chat", chatRoutes);

await connectDB(process.env.MONGO_URI);

// Bull Board setup
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
    queues: [new BullMQAdapter(ingestQueue)],
    serverAdapter
});

app.use("/admin/queues", serverAdapter.getRouter());

app.listen(process.env.PORT || 5000, () => {
  console.log(`✅ API running on http://localhost:${process.env.PORT || 5000}`);
});
