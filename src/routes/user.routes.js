import express from "express";
import { getProfile, updateProfile } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { upload } from "../config/multer.js";
import { requestStreamer } from "../controllers/user.controller.js";

const router = express.Router();

// Profile Setup API
router.put(
  "/profile",
  protect,
  upload.single("avatar"),
  updateProfile
);

router.get("/profile", protect, getProfile);

router.post("/request-streamer", protect, requestStreamer);

export default router;