import express from "express";
import {
  getBalance,
  createPaymentIntent,
  addCoins,
  getTransactions,
  stripeWebhook,
  confirmPayment, 
} from "../controllers/coin.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/balance", protect, getBalance);
router.post("/buy", protect, createPaymentIntent);
router.post("/add", protect, addCoins);
router.post("/confirm", protect, confirmPayment); 
router.get("/transactions", protect, getTransactions);
router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

export default router;