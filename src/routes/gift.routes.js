import express from "express";
import { sendGift, getGiftConfigs, createGiftConfig, toggleGiftConfig } from "../controllers/gift.controller.js";
import { protect, adminOnly } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/send", protect, sendGift);
router.get("/configs", protect, getGiftConfigs);                    
router.post("/configs", protect, adminOnly, createGiftConfig);          
router.put("/configs/:id/toggle", protect, adminOnly, toggleGiftConfig); 

export default router;