import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["SUPERADMIN", "USER"], default: "USER" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    // store current refresh token (simple MVP). Later: allow multiple devices.
    refreshTokenHash: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
