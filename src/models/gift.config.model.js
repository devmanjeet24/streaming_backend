import mongoose from "mongoose";

const giftConfigSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true }, 
  name: { type: String, required: true },
  emoji: { type: String, required: true },
  coinCost: { type: Number, required: true },
  diamondsEarned: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("GiftConfig", giftConfigSchema);