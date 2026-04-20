import express from "express";
import {
  adminLogin,
  getRequests,
  approveRequest,
  rejectRequest,
} from "../controllers/admin.controller.js";
import {
  getGiftConfigs,
  createGiftConfig,
  toggleGiftConfig,
} from "../controllers/gift.controller.js";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

  
router.post("/login", adminLogin);
router.get("/requests", protect, adminOnly, getRequests);
router.put("/approve/:id", protect, adminOnly, approveRequest);
router.put("/reject/:id", protect, adminOnly, rejectRequest);

// ✅ Admin gift management
router.get("/gifts", protect, adminOnly, getGiftConfigs);
router.post("/gifts", protect, adminOnly, createGiftConfig);
router.put("/gifts/:id/toggle", protect, adminOnly, toggleGiftConfig);

export default router;