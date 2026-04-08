import express from "express";
import { createStreamToken } from "../controllers/stream.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/token", protect, createStreamToken);

export default router;