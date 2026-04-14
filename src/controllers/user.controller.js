import User from "../models/user.model.js";
import StreamerRequest from "../models/streamerRequest.model.js";

// UPDATE PROFILE (image + username)
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { username } = req.body;

    // ✅ Validation
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!username || username.trim().length < 3) {
      return res.status(400).json({
        message: "Username must be at least 3 characters",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Image (Cloudinary)
    if (req.file) {
      user.avatar = req.file.path; // Cloudinary URL
    }

    user.username = username.trim();

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        username: user.username,
        avatar: user.avatar,
      },
    });

  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-otp -otpExpiry");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
    });

  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch profile",
      error: err.message,
    });
  }
};


export const requestStreamer = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const existing = await StreamerRequest.findOne({
      user: userId,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Request already pending",
      });
    }

    const request = await StreamerRequest.create({
      user: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Streamer request submitted",
      data: request,
    });

  } catch (error) {
    console.error("REQUEST STREAMER ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send request",
      error: error.message,
    });
  }
};

export const getAllStreamers = async (req, res) => {
  try {
    const streamers = await User.find({ role: "streamer" })
      .select("username avatar role");
    res.json({ success: true, streamers });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};