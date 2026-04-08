import User from "../models/user.model.js";
import StreamerRequest from "../models/streamerRequest.model.js";
import jwt from "jsonwebtoken";

/// 🔐 ADMIN LOGIN (simple env based)
export const adminLogin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    const user = await User.findOne({ email });

    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(200).json({
      success: true,
      message: "Admin login success",
      accessToken,
    });

  } catch (error) {
    console.error("ADMIN LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Admin login failed",
      error: error.message,
    });
  }
};


/// 📋 GET ALL REQUESTS
export const getRequests = async (req, res) => {
  try {
    const requests = await StreamerRequest.find()
      .populate("user", "email username avatar role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });

  } catch (error) {
    console.error("GET REQUESTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch requests",
      error: error.message,
    });
  }
};


/// ✅ APPROVE REQUEST
export const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;

    const request = await StreamerRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Request already processed",
      });
    }

    request.status = "approved";
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();

    await request.save();

    await User.findByIdAndUpdate(request.user, {
      role: "streamer",
    });

    return res.status(200).json({
      success: true,
      message: "User approved as streamer",
    });

  } catch (error) {
    console.error("APPROVE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Approval failed",
      error: error.message,
    });
  }
};


/// ❌ REJECT REQUEST
export const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;

    const request = await StreamerRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Request already processed",
      });
    }

    request.status = "rejected";
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();

    await request.save();

    return res.status(200).json({
      success: true,
      message: "Request rejected",
    });

  } catch (error) {
    console.error("REJECT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Reject failed",
      error: error.message,
    });
  }
};