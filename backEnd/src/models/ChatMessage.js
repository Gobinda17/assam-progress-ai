import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema(
  {
    threadId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatThread", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    citations: [
      {
        documentId: { type: String },
        documentName: { type: String },
        pageNo: { type: Number },
        score: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("ChatMessage", ChatMessageSchema);