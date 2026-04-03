import express from "express";
import { auth } from "../middlewares/auth.middleware.js";
import * as ctrl from "../controllers/streamer.controller.js";
import { sendGift } from "../controllers/gift.controller.js";

const router = express.Router();

// PUBLIC
router.get("/", ctrl.getAllStreamers);
router.get("/:username/join", ctrl.joinStream);

// PRIVATE
router.post("/request", auth, ctrl.requestStreamer);
router.get("/request/status", auth, ctrl.getRequestStatus);

router.get("/profile", auth, ctrl.getStreamerProfile);
router.put("/profile", auth, ctrl.updateStreamerProfile);

router.post("/go-live", auth, ctrl.goLive);
router.post("/end-live", auth, ctrl.endLive);

router.post("/:username/gift", auth, sendGift);

router.post("/withdraw", auth, ctrl.requestWithdraw);
router.get("/withdrawals", auth, ctrl.getWithdrawals);

router.get("/earnings", auth, ctrl.getEarnings);
router.post("/milestone", auth, ctrl.addMilestone);

export default router;