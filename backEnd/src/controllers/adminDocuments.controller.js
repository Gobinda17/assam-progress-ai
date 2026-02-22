import fs from "fs";
import path from "path";
import Document from "../models/Document.js";
import { ingestQueue } from "../queue/ingestQueue.js";
import { qdrant } from "../services/qdrant.js";


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

        const filePath = doc.storagePath;
        if (!filePath || !fs.existsSync(filePath)) {
            return res.status(404).json({ message: "File not found on disk" });
        }

        // Force download with original filename
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${encodeURIComponent(doc.filename || path.basename(filePath))}"`
        );

        const stream = fs.createReadStream(filePath);
        stream.on("error", () => res.status(500).end());
        stream.pipe(res);

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

        // 1) Delete vectors from Qdrant (all points with payload.documentId == id)
        try {
            await qdrant.delete(collection, {
                wait: true,
                filter: {
                    must: [{ key: "documentId", match: { value: id } }],
                },
            });
        } catch (e) {
            // If Qdrant deletion fails, do not delete Mongo/file (keeps consistency)
            return res.status(500).json({ message: `Failed to delete vectors: ${e.message}` });
        }

        // 2) Delete file from disk
        try {
            if (doc.storagePath && fs.existsSync(doc.storagePath)) {
                fs.unlinkSync(doc.storagePath);
            }
        } catch (e) {
            // File delete failed; still remove Mongo to avoid orphan UI, but report it
            // If you prefer strict consistency, return error instead.
            console.warn("File delete failed:", e.message);
        }

        // 3) Delete Mongo record
        await Document.deleteOne({ _id: id });

        return res.json({ ok: true, deletedDocumentId: id });
    } catch (err) {
        console.error("deleteAdminDocument error:", err);
        return res.status(500).json({ message: err.message || "Deletion failed" });
    }
}