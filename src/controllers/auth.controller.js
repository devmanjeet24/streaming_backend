import User from "../models/user.model.js";
import { generateOTP } from "../utils/generateOTP.js";
import { sendOTPEmail } from "../services/email.service.js";
import {
    generateAccessToken,
    generateRefreshToken,
} from "../services/token.service.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const emailAuth = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) return res.status(400).json({ message: "Email is required" });
        if (!email.includes("@")) return res.status(400).json({ message: "Invalid email" });
        let user = await User.findOne({ email });

        // ✅ Track karo new hai ya existing
        const isNewUser = !user;

        if (!user) {
            user = await User.create({ email });
        }

        const otp = generateOTP().toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 5 * 60 * 1000;
        await user.save();

        await sendOTPEmail(email, otp);

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            isNewUser, 
            accessToken,
            refreshToken,
        });

    } catch (err) {
        console.error("EMAIL AUTH ERROR:", err.message);
        return res.status(500).json({ success: false, message: "Failed to send OTP", error: err.message });
    }
};



export const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: "Google token is required" });
        }

        // const ticket = await client.verifyIdToken({
        //   idToken: token,
        //   audience: process.env.GOOGLE_CLIENT_ID,
        // });
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { email, sub } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                googleId: sub,
                isVerified: true,
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken;
        await user.save();

        return res.status(200).json({
            success: true,
            accessToken,
            refreshToken,
        });

    } catch (err) {
        console.error("GOOGLE AUTH ERROR:", err.message);

        return res.status(500).json({
            success: false,
            message: "Google login failed",
            error: err.message,
        });
    }
};



export const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // ✅ Validation
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ✅ FIX: string comparison
        if (user.otp != otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        user.refreshToken = refreshToken;

        await user.save();

        return res.status(200).json({
            success: true,
            accessToken,
            refreshToken,
        });

    } catch (err) {
        console.error("VERIFY OTP ERROR:", err.message);

        return res.status(500).json({
            success: false,
            message: "OTP verification failed",
            error: err.message,
        });
    }
};



export const saveDOB = async (req, res) => {
  try {
    const { dob } = req.body;
    const userId = req.user?.id;

    // ✅ Validation
    if (!dob) {
      return res.status(400).json({ message: "DOB is required" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Convert DOB
    const birthDate = new Date(dob);
    const today = new Date();

    if (isNaN(birthDate)) {
      return res.status(400).json({ message: "Invalid DOB format" });
    }

    // ✅ Age calculation
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    
    if (age < 18) {
      return res.status(400).json({
        message: "You must be at least 18 years old",
      });
    }

    
    user.dob = birthDate;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "DOB saved successfully",
    });

  } catch (err) {
    console.error("SAVE DOB ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to save DOB",
      error: err.message,
    });
  }
};



export const refreshTokenHandler = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: "Refresh token required" });
        }

        const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== token) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        const newAccessToken = generateAccessToken(user);

        return res.status(200).json({
            success: true,
            accessToken: newAccessToken,
        });

    } catch (err) {
        console.error("REFRESH TOKEN ERROR:", err.message);

        return res.status(401).json({
            success: false,
            message: "Token expired",
        });
    }
};



export const resendOTP = async (req, res) => {
    console.log("🔥 RESEND OTP HIT");
    try {
        const { email } = req.body;

        // 🔐 Validation
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // ⛔ Prevent spam (30 sec rule)
        if (user.otpExpiry) {
            const otpSentAt = user.otpExpiry - 5 * 60 * 1000; // OTP kab bheja
            const secondsSinceSent = (Date.now() - otpSentAt) / 1000; // kitne second guzre

            if (secondsSinceSent < 30) {
                return res.status(429).json({
                    message: "Please wait before requesting OTP again",
                });
            }
        }

        // 🔢 Generate OTP
        const otp = generateOTP();

        user.otp = otp;
        user.otpExpiry = Date.now() + 5 * 60 * 1000;

        await user.save();

        // 📧 Send email
        await sendOTPEmail(email, otp);

        console.log("RESEND OTP HIT");

        return res.status(200).json({
            success: true,
            message: "OTP resent successfully",
        });

    } catch (err) {
        console.error("RESEND OTP ERROR FULL:", err);

        return res.status(500).json({
            success: false,
            message: "Failed to resend OTP",
            error: err.message,
        });
    }
};