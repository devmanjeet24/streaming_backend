import express from "express";
import authCtrl from "../controllers/auth.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);
router.post("/logout", auth, authCtrl.logout);
router.post("/verify-email", authCtrl.verifyEmail);
router.post("/resend-otp", authCtrl.resendOtp);
router.post("/forgot-password", authCtrl.forgotPassword);
router.post("/reset-password", authCtrl.resetPassword);
router.post("/email", authCtrl.emailAuth);
router.post("/verify-otp", authCtrl.verifyOtpLogin);

export default router;