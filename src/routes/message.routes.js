import express from "express";
import { auth } from "../middlewares/auth.middleware.js";
import * as msgCtrl from "../controllers/message.controller.js";

const router = express.Router();

// ✅ Inbox (all conversations)
router.get("/", auth, msgCtrl.getConversations);

// ✅ Get chat with specific user
router.get("/:username", auth, msgCtrl.getChat);

// ✅ Send message
router.post("/:username", auth, msgCtrl.sendMessage);

// ✅ Mark messages as read
router.put("/:username/read", auth, msgCtrl.markRead);

export default router;