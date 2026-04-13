import express from "express";
import { sendGift } from "../controllers/gift.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/send", protect, sendGift);

export default router;