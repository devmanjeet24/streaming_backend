import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },

    isVerified: {
        type: Boolean,
        default: false,
    },

    dob: {
        type: Date,
    },

    username: {
        type: String,
    },

    avatar: {
        type: String,
    },

    role: {
        type: String,
        enum: ["admin", "manager", "user"],
        default: "user",
    },

    googleId: String,

    otp: String,
    otpExpiry: Date,

    refreshToken: String,
}, { timestamps: true });

export default mongoose.model("User", userSchema);