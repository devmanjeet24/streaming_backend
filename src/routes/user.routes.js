import express from "express";
import { auth } from "../middlewares/auth.middleware.js";
import {
  getProfile,
  createProfile,
  updateProfile,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile", auth, getProfile);
router.post("/profile", auth, createProfile);
router.put("/profile", auth, updateProfile);

export default router;