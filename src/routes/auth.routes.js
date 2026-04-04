import express from "express";
import {
  emailAuth,
  googleAuth,
  verifyOTP,
  saveDOB,
  refreshTokenHandler,
} from "../controllers/auth.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/email", emailAuth);
router.post("/google", googleAuth);
router.post("/verify-otp", verifyOTP);
router.post("/dob", protect, saveDOB);
router.post("/refresh", refreshTokenHandler);

export default router;