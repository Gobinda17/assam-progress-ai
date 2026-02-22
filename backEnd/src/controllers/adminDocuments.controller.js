import fs from "fs";
import path from "path";
import Document from "../models/Document.js";
import { ingestQueue } from "../queue/ingestQueue.js";
import { qdrant } from "../services/qdrant.js";

function resolveDocumentPath(doc) {
    const uploadDir = process.env.UPLOAD_DIR || "/app/storage/uploads";
    const candidates = [];

    if (doc?.storagePath) {
        candidates.push(doc.storagePath);

        if (!path.isAbsolute(doc.storagePath)) {
            candidates.push(path.join(uploadDir, doc.storagePath));
        }

        candidates.push(path.join(uploadDir, path.basename(doc.storagePath)));
    }

    if (doc?._id) {
        candidates.push(path.join(uploadDir, `${doc._id}.pdf`));
    }

    for (const candidate of candidates) {
        if (candidate && fs.existsSync(candidate)) {
            return candidate;
        }
    }

    return null;
}


export async function uploadAdminPdf(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "file missing" });

    // documentId created in multer filename() and attached to req
    const documentId = req.documentId;
    if (!documentId) {
      return res.status(500).json({ message: "documentId missing (upload middleware issue)" });
    }

    // final path is exactly where multer saved it
    const uploadDir = process.env.UPLOAD_DIR || "/app/storage/uploads";
    const finalPath = path.join(uploadDir, `${documentId}.pdf`);

    // Safety check: file exists
    if (!fs.existsSync(finalPath)) {
      return res.status(500).json({ message: "Uploaded file not found on disk" });
    }

    // metadata for filtering (keep consistent)
    const category = req.body.category ? String(req.body.category).toLowerCase() : "others";
    const state = req.body.state ? String(req.body.state) : "";
    const district = req.body.district ? String(req.body.district) : "";

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
      progress: { stage: "queued" },
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


export async function downloadAdminDocument(req, res) {
    try {
        const { id } = req.params;

        const doc = await Document.findById(id).lean();
        if (!doc) return res.status(404).json({ message: "Document not found" });

        const filePath = resolveDocumentPath(doc);
        if (!filePath) {
            return res.status(404).json({ message: "File not found on disk" });
        }

        return res.download(filePath, doc.filename || path.basename(filePath));

    } catch (err) {
        console.error("downloadAdminDocument error:", err);
        return res.status(500).json({ message: err.message || "Download failed" });
    }
}

export async function deleteAdminDocument(req, res) {
    try {
        const { id } = req.params;
        const collection = process.env.QDRANT_COLLECTION;

        const doc = await Document.findById(id);
        if (!doc) return res.status(404).json({ message: "Document not found" });

        // MVP safety: block delete while processing
        if (doc.status === "processing") {
            return res.status(409).json({
                message: "Document is processing. Try again after it finishes or implement cancel support.",
            });
        }

        // 1) Delete vectors from Qdrant (best-effort)
        let qdrantCleanupError = null;
        if (collection) {
            try {
                await qdrant.delete(collection, {
                    wait: true,
                    filter: {
                        must: [{ key: "documentId", match: { value: String(id) } }],
                    },
                });
            } catch (e) {
                qdrantCleanupError = e.message;
                console.warn(`Qdrant delete warning for ${id}:`, e.message);
            }
        }

        // 2) Delete file from disk
        try {
            const filePath = resolveDocumentPath(doc);
            if (filePath) {
                fs.unlinkSync(filePath);
            }
        } catch (e) {
            console.warn("File delete failed:", e.message);
        }

        // 3) Delete Mongo record
        await Document.deleteOne({ _id: id });

        return res.json({
            ok: true,
            deletedDocumentId: id,
            qdrantCleanup: qdrantCleanupError ? "warning" : "ok",
            qdrantWarning: qdrantCleanupError || undefined,
        });
    } catch (err) {
        console.error("deleteAdminDocument error:", err);
        return res.status(500).json({ message: err.message || "Deletion failed" });
    }
}