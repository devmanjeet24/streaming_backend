import express from "express";
import { auth } from "../middlewares/auth.middleware.js";
import * as giftCtrl from "../controllers/gift.controller.js";

const router = express.Router();

// ✅ Get all gifts (Public)
router.get("/", giftCtrl.getGifts);

// ✅ Send gift
router.post("/streamers/:username/gift", auth, giftCtrl.sendGift);

export default router;