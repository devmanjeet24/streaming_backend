import express from "express";
import { auth } from "../middlewares/auth.middleware.js";
import * as walletCtrl from "../controllers/wallet.controller.js";

const router = express.Router();

// ✅ Get Wallet Balance
router.get("/", auth, walletCtrl.getWallet);

// ✅ Topup Wallet
router.post("/topup", auth, walletCtrl.topup);

// ❗ Future: Transactions history (optional)
router.get("/transactions", auth, async (req, res) => {
  try {
    return res.status(200).json({
      message: "Transaction history coming soon",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/test/add-balance", auth, walletCtrl.addTestBalance);

export default router;