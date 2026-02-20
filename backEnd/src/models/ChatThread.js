import mongoose from "mongoose";

const ChatThreadSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // scope of chat (MVP = global corpus uploaded by admin)
    category: { type: String, default: "all" },
    state: { type: String, default: "" },
    district: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("ChatThread", ChatThreadSchema);