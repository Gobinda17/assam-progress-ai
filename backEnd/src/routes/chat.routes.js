import express from "express";
import { requireAuth } from "../middlewares/auth.js";
import { chatStreamSSE, getChatHistory } from "../controllers/chat.controller.js";

const router = express.Router();

// End-user chat stream (requires login for MVP)
router.get("/history", requireAuth, getChatHistory);
router.get("/stream", requireAuth, chatStreamSSE);

export default router;