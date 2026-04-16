import express from "express";
import { createStreamToken } from "../controllers/stream.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import Message from "../models/message.model.js";

const router = express.Router();

router.post("/token", protect, createStreamToken);

// ✅ Chat history route
router.get("/chat/:roomId", protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .limit(100);
    res.json({ success: true, messages });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;