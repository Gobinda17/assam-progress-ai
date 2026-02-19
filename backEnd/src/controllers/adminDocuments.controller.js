import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import Document from "../models/Document.js";
import { ingestQueue } from "../queue/ingestQueue.js";

export async function uploadAdminPdf(req, res) {
    try {
        if (!req.file) return res.status(400).json({ message: "file missing" });

        const documentId = nanoid();
        const uploadDir = process.env.UPLOAD_DIR || "storage/uploads";
        fs.mkdirSync(uploadDir, { recursive: true });

        const ext = path.extname(req.file.originalname).toLowerCase() || ".pdf";
        const finalPath = path.join(uploadDir, `${documentId}${ext}`);

        // move from tmp to final
        fs.renameSync(req.file.path, finalPath);

        // metadata for filtering
        const category = (req.body.category || "all").toLowerCase();
        const state = req.body.state || "";
        const district = req.body.district || "";

        await Document.create({
            _id: documentId,
            uploadedBy: req.user.userId,
            filename: req.file.originalname,
            mime: req.file.mimetype,
            sizeBytes: req.file.size,
            storagePath: finalPath,
            category,
            state,
            district,
            status: "queued",
            progress: { stage: "queued" }
        });

        // enqueue ingestion job
        await ingestQueue.add("ingest", { documentId });

        return res.status(201).json({ documentId, status: "queued" });
    } catch (err) {
        console.error("uploadAdminPdf error:", err);
        return res.status(500).json({ message: err.message || "Upload failed" });
    }
}

export async function listAdminDocs(req, res) {
    const docs = await Document.find().sort({ createdAt: -1 }).lean();
    res.json(docs);
}

export async function getAdminDocStatus(req, res) {
    const doc = await Document.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ message: "not found" });
    res.json({ id: doc._id, status: doc.status, progress: doc.progress, errorMessage: doc.errorMessage });
}
