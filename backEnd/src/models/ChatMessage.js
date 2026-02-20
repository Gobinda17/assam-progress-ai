import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema(
  {
    threadId: { type: mongoose.Schema.Types.ObjectId, ref: "ChatThread", required: true },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("ChatMessage", ChatMessageSchema);