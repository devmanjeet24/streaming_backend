import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  user: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true });

// ✅ 30 din purane messages auto-delete
messageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export default mongoose.model("Message", messageSchema);