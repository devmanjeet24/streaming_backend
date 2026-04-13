import express from "express";
import { getBalance, createPaymentIntent, addCoins } from "../controllers/coin.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/balance", protect, getBalance);
router.post("/buy", protect, createPaymentIntent);
router.post("/add", protect, addCoins); // testing ke liye — real mein webhook se hoga

export default router;