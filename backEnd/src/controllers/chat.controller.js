import Document from "../models/Document.js";
import ChatThread from "../models/ChatThread.js";
import ChatMessage from "../models/ChatMessage.js";

import { embedBatch } from "../services/openai.js"; // we already made embedBatch(texts)
import { openai } from "../services/openai.js"; // export openai instance too
import { qdrant } from "../services/qdrant.js";

function sseHeaders(res) {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();
}

function sseEvent(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

function buildQdrantFilter({ readyDocIds, category, state, district }) {
  const must = [];

  // Only docs that are READY in MongoDB
  must.push({
    key: "documentId",
    match: { any: readyDocIds }, // Qdrant keyword match-any
  });

  if (category && category !== "all") {
    must.push({ key: "category", match: { value: category } });
  }

  if (district) {
    must.push({ key: "district", match: { value: district } });
  } else if (state) {
    must.push({ key: "state", match: { value: state } });
  }

  return { must };
}

export async function chatStreamSSE(req, res) {
  const question = String(req.query.q || "").trim();
  const category = String(req.query.category || "all").toLowerCase();
  const state = String(req.query.state || "");
  const district = String(req.query.district || "");
  const threadId = req.query.threadId ? String(req.query.threadId) : null;

  if (!question) return res.status(400).json({ message: "q is required" });

  sseHeaders(res);
  sseEvent(res, "ready", { ok: true });

  try {
    // 1) Resolve thread
    let thread;
    if (threadId) {
      thread = await ChatThread.findOne({
        _id: threadId,
        userId: req.user.userId,
      });
    }
    if (!thread) {
      thread = await ChatThread.create({
        userId: req.user.userId,
        category,
        state,
        district,
      });
      sseEvent(res, "thread", { threadId: thread._id.toString() });
    }

    // 2) Store user message
    await ChatMessage.create({
      threadId: thread._id,
      role: "user",
      content: question,
    });

    // 3) Get READY documents list (scoped by filters)
    // Keep query aligned with how your admin uploads metadata
    const docQuery = { status: "ready" };
    if (category !== "all") docQuery.category = category;
    if (district) docQuery.district = district;
    else if (state) docQuery.state = state;

    const readyDocs = await Document.find(docQuery)
      .select("_id filename")
      .lean();
    if (!readyDocs.length) {
      const msg =
        "No verified documents are available for the selected filters yet.";
      sseEvent(res, "token", { delta: msg });
      sseEvent(res, "done", {});
      return res.end();
    }

    const readyDocIds = readyDocs.map((d) => d._id);
    const docNameById = new Map(readyDocs.map((d) => [d._id, d.filename]));

    // 4) Embed the question
    const [queryVec] = await embedBatch([question]);

    // 5) Retrieve topK chunks from Qdrant
    const filter = buildQdrantFilter({
      readyDocIds,
      category,
      state,
      district,
    });

    const topK = 10;
    const hits = await qdrant.search(process.env.QDRANT_COLLECTION, {
      vector: queryVec,
      limit: topK,
      filter,
      with_payload: true,
    });

    if (!hits?.length) {
      const msg =
        "Information is not available in verified uploaded documents.";
      sseEvent(res, "token", { delta: msg });
      sseEvent(res, "done", {});
      return res.end();
    }

    const context = hits
      .map((h) => {
        const p = h.payload || {};
        return `Document: ${docNameById.get(p.documentId) || p.documentId}\nPage ${p.pageNo}:\n${p.text}`;
      })
      .join("\n\n---\n\n");

    const citations = hits.map((h) => {
      const p = h.payload || {};
      return {
        documentId: p.documentId,
        documentName: docNameById.get(p.documentId) || p.documentId,
        pageNo: p.pageNo,
        score: h.score,
      };
    });

    // 6) Stream answer from OpenAI (SSE tokens)
    let finalText = "";

    const stream = await openai.responses.stream({
      model: "gpt-5.2-mini",
      input: [
        {
          role: "system",
          content:
            "You are a helpful assistant. Answer ONLY using the provided context from verified PDFs. " +
            "If the answer is not in context, say it is not available in verified documents. " +
            "Keep the answer clear and practical.",
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion:\n${question}`,
        },
      ],
    });

    for await (const event of stream) {
      if (event.type === "response.output_text.delta") {
        finalText += event.delta;
        sseEvent(res, "token", { delta: event.delta });
      }
      if (event.type === "response.completed") {
        break;
      }
    }

    // 7) Save assistant message + send citations
    await ChatMessage.create({
      threadId: thread._id,
      role: "assistant",
      content: finalText || "(no output)",
    });

    sseEvent(res, "citations", { citations });
    sseEvent(res, "done", {});
    res.end();
  } catch (err) {
    sseEvent(res, "error", { message: err.message || "stream error" });
    res.end();
  }
}
