import multer from "multer";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

const uploadDir = process.env.UPLOAD_DIR || "/app/storage/uploads";
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),

  filename: (req, file, cb) => {
    // Generate documentId once and attach to request
    const documentId = nanoid();
    req.documentId = documentId;

    // Always save as .pdf
    cb(null, `${documentId}.pdf`);
  },
});

export const uploadPdf = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_UPLOAD_MB || 250) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Only PDFs
    if (file.mimetype !== "application/pdf") return cb(new Error("Only PDF allowed"));
    cb(null, true);
  },
});