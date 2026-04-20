import Coin from "../models/coin.model.js";
import Gift from "../models/gift.model.js";
import GiftConfig from "../models/gift.config.model.js";
import Transaction from "../models/transaction.model.js";
import User from "../models/user.model.js";
import { getGifts } from "../config/gifts.js";
import { getIO } from "../socket/socket.js";

// POST /gifts/send
export const sendGift = async (req, res) => {
  try {
    const { giftType, roomId, receiverUsername } = req.body;
    const sender = req.user;

    const GIFTS = await getGifts();
    const gift = GIFTS[giftType];
    if (!gift) return res.status(400).json({ message: "Invalid gift" });

    const senderCoins = await Coin.findOne({ user: sender._id });
    if (!senderCoins || senderCoins.balance < gift.coinCost) {
      return res.status(400).json({ message: "Insufficient coins" });
    }

    const receiver = await User.findOne({ username: receiverUsername });
    if (!receiver) return res.status(404).json({ message: "Streamer not found" });

    senderCoins.balance -= gift.coinCost;
    await senderCoins.save();

    // Transaction save karo
    await Transaction.create({
      user: sender._id,
      type: "debit",
      amount: gift.coinCost,
      description: `Sent ${gift.name} ${gift.emoji} to ${receiverUsername}`,
    });

    let receiverCoins = await Coin.findOne({ user: receiver._id });
    if (!receiverCoins) receiverCoins = new Coin({ user: receiver._id, balance: 0 });
    receiverCoins.balance += gift.diamondsEarned;
    await receiverCoins.save();

    await Gift.create({
      sender: sender._id,
      receiver: receiver._id,
      giftType,
      coinCost: gift.coinCost,
      diamondsEarned: gift.diamondsEarned,
      roomId,
    });

    const io = getIO();
    io.to(roomId).emit("receive-gift", {
      senderName: sender.username,
      giftType,
      emoji: gift.emoji,
      giftName: gift.name,
    });

    res.json({ success: true, newBalance: senderCoins.balance });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /gifts/configs — Flutter gift panel ke liye
export const getGiftConfigs = async (req, res) => {
  try {
    const gifts = await GiftConfig.find({ isActive: true }).sort({ coinCost: 1 });
    res.json({ success: true, gifts });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /gifts/configs — Admin create gift
export const createGiftConfig = async (req, res) => {
  try {
    const { type, name, emoji, coinCost, diamondsEarned } = req.body;
    if (!type || !name || !emoji || !coinCost || !diamondsEarned) {
      return res.status(400).json({ message: "All fields required" });
    }
    const gift = await GiftConfig.create({ type, name, emoji, coinCost, diamondsEarned });
    res.json({ success: true, gift });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// PUT /gifts/configs/:id/toggle — Admin toggle
export const toggleGiftConfig = async (req, res) => {
  try {
    const gift = await GiftConfig.findById(req.params.id);
    if (!gift) return res.status(404).json({ message: "Gift not found" });
    gift.isActive = !gift.isActive;
    await gift.save();
    res.json({ success: true, gift });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};