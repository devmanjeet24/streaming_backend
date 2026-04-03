import Message from "../models/Message.js";
import { v4 as uuidv4 } from "uuid";
import { getIO } from "../sockets/index.js";



// INBOX
export const getConversations = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id },
      ],
    });

    return res.status(200).json(messages);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// SINGLE CHAT
export const getChat = async (req, res) => {
  try {
    const receiverUser = await User.findOne({
      username: req.params.username,
    });

    if (!receiverUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: receiverUser._id },
        { sender: receiverUser._id, receiver: req.user.id },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json(messages);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// SEND MESSAGE
export const sendMessage = async (req, res) => {
  try {
    const receiverUser = await User.findOne({
      username: req.params.username,
    });

    if (!receiverUser) {
      return res.status(404).json({
        message: "Receiver not found",
      });
    }

    const msg = await Message.create({
      messageId: uuidv4(),
      sender: req.user.id,
      receiver: receiverUser._id,
      text: req.body.text,
    });

    // 🔌 SOCKET
    const io = getIO();
    io.to(receiverUser._id.toString()).emit("new_message", msg);

    return res.status(201).json({
      success: true,
      data: msg,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// MARK READ
export const markRead = async (req, res) => {
  try {
    const senderUser = await User.findOne({
      username: req.params.username,
    });

    await Message.updateMany(
      {
        sender: senderUser._id,
        receiver: req.user.id,
      },
      { read: true }
    );

    return res.status(200).json({
      message: "Messages marked as read",
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};