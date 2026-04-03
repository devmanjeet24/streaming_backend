import mongoose from "mongoose";

const streamerSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

        channelName: String,
        description: String,
        categories: [String],

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },

        rejectionReason: String,

        isLive: { type: Boolean, default: false },

        earnings: { type: Number, default: 0 },
        milestones: [
            {
                title: String,
                target: Number,
                achieved: { type: Boolean, default: false },
            }
        ],
    },
    { timestamps: true }
);

export default mongoose.model("Streamer", streamerSchema);