import mongoose from "mongoose";

const schema = new mongoose.Schema({
  streamerId: mongoose.Schema.Types.ObjectId,
  amount: Number,
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  bankDetails: Object,
}, { timestamps: true });

export default mongoose.model("Withdrawal", schema);