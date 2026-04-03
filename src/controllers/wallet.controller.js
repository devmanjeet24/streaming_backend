import User from "../models/User.js";
import { v4 as uuidv4 } from "uuid";
import { createPaymentIntent } from "../services/stripe.service.js";
// import User from "../models/User.js";

// ✅ BALANCE
export const getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    return res.status(200).json({
      balance: user.walletBalance,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ TOPUP
export const topup = async (req, res) => {
  try {
    const { amount } = req.body;

    const user = await User.findById(req.user.id);

    user.walletBalance += amount;

    await user.save();

    return res.status(200).json({
      transactionId: uuidv4(),
      message: "Topup successful",
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ CREATE PAYMENT INTENT
export const createTopupIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    const intent = await createPaymentIntent(amount, req.user.id);

    return res.status(200).json({
      clientSecret: intent.client_secret,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ CONFIRM TOPUP (Webhook alternative)
export const confirmTopup = async (req, res) => {
  try {
    const { amount } = req.body;

    const user = await User.findById(req.user.id);
    user.walletBalance += amount;

    await user.save();

    return res.status(200).json({
      message: "Wallet updated",
      balance: user.walletBalance,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addTestBalance = async (req, res) => {
  try {

    // ✅ SECURITY CHECK
    if (process.env.NODE_ENV !== "development") {
      return res.status(403).json({
        message: "Not allowed in production",
      });
    }

    const { amount } = req.body;

    const user = await User.findById(req.user.id);

    user.walletBalance += amount;

    await user.save();

    return res.status(200).json({
      message: "Test balance added",
      balance: user.walletBalance,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};