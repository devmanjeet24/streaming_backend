import Streamer from "../models/Streamer.js";
import User from "../models/User.js";
import { generateLiveToken } from "../services/livekit.service.js";
import Withdrawal from "../models/Withdrawal.js";


// ✅ REQUEST STREAMER
export const requestStreamer = async (req, res) => {
  try {
    // check existing
    const existing = await Streamer.findOne({ userId: req.user.id });

    if (existing) {
      return res.status(400).json({
        message: "Request already exists",
      });
    }

    // create new
    const newStreamer = await Streamer.create({
      userId: req.user.id,
    });

    return res.status(201).json({
      success: true,
      data: newStreamer,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ REQUEST STATUS
export const getRequestStatus = async (req, res) => {
  try {
    const streamer = await Streamer.findOne({ userId: req.user.id });

    if (!streamer) {
      return res.status(404).json({ message: "No request found" });
    }

    return res.status(200).json({
      status: streamer.status,
      rejectionReason: streamer.rejectionReason,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ GET OWN STREAMER PROFILE
export const getStreamerProfile = async (req, res) => {
  try {
    // const streamer = await Streamer.findOne({ userId: req.user.id });
    const user = await User.findOne({ username });
const streamer = await Streamer.findOne({ userId: user._id });

    return res.status(200).json(streamer);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ UPDATE STREAMER PROFILE
export const updateStreamerProfile = async (req, res) => {
  try {
    const updated = await Streamer.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true }
    );

    return res.status(200).json(updated);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ GO LIVE
export const goLive = async (req, res) => {
  try {
    // const streamer = await Streamer.findOne({ userId: req.user.id });
    const user = await User.findOne({ username });
const streamer = await Streamer.findOne({ userId: user._id });

    if (!streamer || streamer.status !== "approved") {
      return res.status(403).json({ message: "Not approved" });
    }

    streamer.isLive = true;
    await streamer.save();

    const token = generateLiveToken(`room_${streamer._id}`, req.user.id);

    return res.status(200).json({
      token,
      room: `room_${streamer._id}`,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ END LIVE
export const endLive = async (req, res) => {
  try {
    // const streamer = await Streamer.findOne({ userId: req.user.id });
    const user = await User.findOne({ username });
const streamer = await Streamer.findOne({ userId: user._id });

    streamer.isLive = false;
    await streamer.save();

    return res.status(200).json({ message: "Live ended" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ DISCOVERY (PUBLIC)
export const getAllStreamers = async (req, res) => {
  try {
    const streamers = await Streamer.find({ status: "approved" });

    return res.status(200).json(streamers);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ JOIN STREAM
export const joinStream = async (req, res) => {
  try {
    const streamer = await Streamer.findById(req.params.id);

    if (!streamer.isLive) {
      return res.status(400).json({ message: "Stream offline" });
    }

    const token = generateLiveToken(`room_${streamer._id}`, req.user.id);

    return res.status(200).json({
      token,
      room: `room_${streamer._id}`,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getEarnings = async (req, res) => {
  try {
    // const streamer = await Streamer.findOne({ userId: req.user.id });
    const user = await User.findOne({ username });
const streamer = await Streamer.findOne({ userId: user._id });

    return res.status(200).json({
      earnings: streamer.earnings,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const requestWithdraw = async (req, res) => {
  try {
    const { amount, bankDetails } = req.body;

    // const streamer = await Streamer.findOne({ userId: req.user.id });
    const user = await User.findOne({ username });
const streamer = await Streamer.findOne({ userId: user._id });

    if (streamer.earnings < amount) {
      return res.status(400).json({ message: "Insufficient earnings" });
    }

    streamer.earnings -= amount;

    await streamer.save();

    const withdrawal = await Withdrawal.create({
      streamerId: streamer._id,
      amount,
      bankDetails,
    });

    return res.status(201).json(withdrawal);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// HISTORY
export const getWithdrawals = async (req, res) => {
  try {
    // const streamer = await Streamer.findOne({ userId: req.user.id });
    const user = await User.findOne({ username });
const streamer = await Streamer.findOne({ userId: user._id });

    const history = await Withdrawal.find({
      streamerId: streamer._id,
    });

    return res.status(200).json(history);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ ADD MILESTONE
export const addMilestone = async (req, res) => {
  try {
    const { title, target } = req.body;

    if (!title || !target) {
      return res.status(400).json({
        message: "Title and target required",
      });
    }

    // const streamer = await Streamer.findOne({ userId: req.user.id });
    const user = await User.findOne({ username });
const streamer = await Streamer.findOne({ userId: user._id });

    if (!streamer) {
      return res.status(404).json({
        message: "Streamer not found",
      });
    }

    streamer.milestones.push({
      title,
      target,
    });

    await streamer.save();

    return res.status(201).json({
      success: true,
      message: "Milestone added",
      data: streamer.milestones,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};