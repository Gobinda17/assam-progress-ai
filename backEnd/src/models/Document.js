import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // documentId
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    filename: { type: String, required: true },
    mime: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    storagePath: { type: String, required: true }, // disk path now (later S3 key)

    // Filters for your UI
    category: { type: String, required: true, default: "others" },   // health|education|infrastructure|all
  
    status: { type: String, enum: ["queued", "processing", "ready", "failed"], default: "queued" },
    progress: { type: Object, default: { stage: "queued" } },
    errorMessage: { type: String, default: "" }
  },
  { timestamps: true }
);

export default mongoose.model("Document", DocumentSchema);
