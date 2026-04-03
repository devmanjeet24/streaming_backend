import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  // ✅ AUTH MIDDLEWARE
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("No token"));
      }

      const user = jwt.verify(token, process.env.ACCESS_SECRET);

      socket.user = user;
      next();

    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.user.id);

    // ✅ IMPORTANT: join private room (for DM)
    socket.join(socket.user.id);

    // =========================
    // 🎥 JOIN STREAM ROOM
    // =========================
    socket.on("join_stream", (roomId) => {
      socket.join(roomId);

      const count =
        io.sockets.adapter.rooms.get(roomId)?.size || 0;

      io.to(roomId).emit("viewer_count", count);
    });

    // =========================
    // 💬 LIVE CHAT (STREAM)
    // =========================
    socket.on("send_message", ({ roomId, message }) => {
      io.to(roomId).emit("receive_message", {
        user: socket.user.id,
        message,
      });
    });

    // =========================
    // 🎁 GIFT EVENT
    // =========================
    socket.on("send_gift", ({ roomId, gift }) => {
      io.to(roomId).emit("gift_received", {
        gift,
        sender: socket.user.id,
      });
    });

    // =========================
    // 🟢 USER ONLINE
    // =========================
    io.emit("user_online", socket.user.id);

    // =========================
    // 🔴 DISCONNECT
    // =========================
    socket.on("disconnect", () => {
      io.emit("user_offline", socket.user.id);
    });
  });
};

export const getIO = () => io;