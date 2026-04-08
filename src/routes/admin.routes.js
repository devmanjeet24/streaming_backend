import express from "express";
import {
  adminLogin,
  getRequests,
  approveRequest,
  rejectRequest,
} from "../controllers/admin.controller.js";

import { protect, adminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", adminLogin);

router.get("/requests", protect, adminOnly, getRequests);

router.put("/approve/:id", protect, adminOnly, approveRequest);

router.put("/reject/:id", protect, adminOnly, rejectRequest);

export default router;