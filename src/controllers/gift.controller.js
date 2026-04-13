import Coin from "../models/coin.model.js";
import Gift from "../models/gift.model.js";
import User from "../models/user.model.js";
import { GIFTS } from "../config/gifts.js";
import { getIO } from "../socket/socket.js";

export const sendGift = async (req, res) => {
  try {
    const { giftType, roomId, receiverUsername } = req.body;
    const sender = req.user;

    // Gift valid hai?
    const gift = GIFTS[giftType];
    if (!gift) return res.status(400).json({ message: "Invalid gift" });

    // Sender ke coins check karo
    const senderCoins = await Coin.findOne({ user: sender._id });
    if (!senderCoins || senderCoins.balance < gift.coinCost) {
      return res.status(400).json({ message: "Insufficient coins" });
    }

    // Receiver dhundo
    const receiver = await User.findOne({ username: receiverUsername });
    if (!receiver) return res.status(404).json({ message: "Streamer not found" });

    // Coins deduct karo sender se
    senderCoins.balance -= gift.coinCost;
    await senderCoins.save();

    // Diamonds add karo receiver ko (Coin model mein diamonds bhi track honge)
    let receiverCoins = await Coin.findOne({ user: receiver._id });
    if (!receiverCoins) {
      receiverCoins = new Coin({ user: receiver._id, balance: 0 });
    }
    receiverCoins.balance += gift.diamondsEarned;
    await receiverCoins.save();

    // Gift record save karo
    await Gift.create({
      sender: sender._id,
      receiver: receiver._id,
      giftType,
      coinCost: gift.coinCost,
      diamondsEarned: gift.diamondsEarned,
      roomId,
    });

    // Socket se real-time notify karo
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