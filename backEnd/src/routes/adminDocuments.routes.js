import express from "express";
import { requireAuth, requireRole } from "../middlewares/auth.js";
import { uploadPdf } from "../utils/upload.js";
import { uploadAdminPdf, listAdminDocs, getAdminDocStatus } from "../controllers/adminDocuments.controller.js";

const router = express.Router();

// SUPERADMIN only
router.post(
  "/documents/upload",
  requireAuth,
  requireRole("SUPERADMIN"),
  uploadPdf.single("file"),
  uploadAdminPdf
);

router.get("/documents", requireAuth, requireRole("SUPERADMIN"), listAdminDocs);
router.get("/documents/:id/status", requireAuth, requireRole("SUPERADMIN"), getAdminDocStatus);

export default router;
