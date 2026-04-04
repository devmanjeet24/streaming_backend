import express from "express";
import { updateProfile } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { upload } from "../config/multer.js";

const router = express.Router();

// Profile Setup API
router.put(
  "/profile",
  protect,
  upload.single("avatar"),
  updateProfile
);

export default router;