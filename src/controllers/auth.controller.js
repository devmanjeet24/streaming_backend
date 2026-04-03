import User from "../models/User.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import generateTokens  from "../utils/jwt.js";
import generateOTP from "../utils/otp.js";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


// Register 
const register = async (req, res) => {
    try {
        const { email, password, username } = req.body;

        if (!email || !password || !username) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // ✅ FIXED
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // ✅ FIXED typo
        const hashedPassword = await hashPassword(password);
        const otp = generateOTP();

        const user = await User.create({
            email,
            password: hashedPassword,
            username,
            otp,
            otpExpiry: Date.now() + 10 * 60 * 1000,
        });

        res.status(201).json({
            message: "Registered successfully",
            email: user.email,
            username: user.username
            // ❌ OTP removed (security)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

export const emailAuth = async (req, res) => {
  try {
    const { email } = req.body;

    let user = await User.findOne({ email });

    const otp = generateOTP();

    if (!user) {
      user = await User.create({
        email,
        otp,
        otpExpiry: Date.now() + 10 * 60 * 1000,
      });
    } else {
      user.otp = otp;
      user.otpExpiry = Date.now() + 10 * 60 * 1000;
      await user.save();
    }

    return res.json({
      message: "OTP sent",
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const { accessToken, refreshToken } = generateTokens({
            _id: user._id,
        });

        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({
            accessToken,
            refreshToken,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
        });
    }
};


// Logout
const logout = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        user.refreshToken = null;
        await user.save();

        return res.status(200).json({
            message: "Logged out successfully",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
};


const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });

        if (user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        user.isVerified = true;
        user.otp = null;
        user.otpExpiry = null;

        await user.save();

        res.json({ message: "Email verified successfully" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ message: "User not found" });

        const otp = generateOTP();

        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000;

        await user.save();

        res.json({ message: "OTP resent" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const verifyOtpLogin = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });

  if (!user || user.otp !== otp) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  const { accessToken, refreshToken } = generateTokens(user);

  return res.json({
    accessToken,
    refreshToken,
    user,
  });
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const otp = generateOTP();

        user.otp = otp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000;

        await user.save();

        res.json({ message: "OTP sent for reset password" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        const user = await User.findOne({ email });

        if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        user.password = await hashPassword(newPassword);
        user.otp = null;

        await user.save();

        res.json({ message: "Password reset successful" });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        email: payload.email,
        username: payload.name,
        googleId: payload.sub,
        authProvider: "google",
        isVerified: true,
      });
    }

    const tokens = generateTokens(user);

    return res.json(tokens);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export default {
    register,
    login,
    logout,
    verifyEmail,
    resendOtp,
    forgotPassword,
    resetPassword,
    emailAuth,
    verifyOtpLogin,
    googleLogin
};