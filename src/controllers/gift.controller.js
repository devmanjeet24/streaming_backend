import Gift from "../models/Gift.js";
import User from "../models/User.js";
import Streamer from "../models/Streamer.js";
import { getIO } from "../sockets/index.js";

export const getGifts = async (req, res) => {
    try {
        const gifts = await Gift.find();
        return res.status(200).json(gifts);

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const sendGift = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { giftId } = req.body;
    const { username } = req.params;

    const gift = await Gift.findById(giftId);
    const sender = await User.findById(req.user.id);
    const streamer = await Streamer.findOne({ userId: username });

    if (!gift || !sender || !streamer) {
      throw new Error("Invalid data");
    }

    if (sender.walletBalance < gift.price) {
      throw new Error("Insufficient balance");
    }

    sender.walletBalance -= gift.price;
    streamer.earnings += gift.price;

    await sender.save({ session });
    await streamer.save({ session });

    await session.commitTransaction();

    return res.json({ success: true });

  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  }
};