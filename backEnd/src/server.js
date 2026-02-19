import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import adminDocumentsRoutes from "./routes/adminDocuments.routes.js";

const app = express();

app.use(express.json({ limit: "2mb" })); // login payload only
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true, // IMPORTANT for cookies
  })
);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminDocumentsRoutes);

await connectDB(process.env.MONGO_URI);

app.listen(process.env.PORT || 5000, () => {
  console.log(`✅ API running on http://localhost:${process.env.PORT || 5000}`);
});
