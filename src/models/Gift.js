import mongoose from "mongoose";

const giftSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number, // coins
      required: true,
    },

    image: {
      type: String, // icon URL
    },

    animation: {
      type: String, // animation file (frontend use)
    },

    category: {
      type: String, // optional (e.g. "premium", "basic")
      default: "basic",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Gift", giftSchema);