import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    /// 🔥 JOIN ROOM
    socket.on("join-room", (data) => {
      console.log("JOIN DATA:", data);

      const roomId = data?.roomId;
      const username = data?.username;

      if (!roomId || !username) {
        console.log("❌ INVALID JOIN DATA");
        return;
      }

      socket.join(roomId);

      console.log(`👤 ${username} joined room: ${roomId}`);

      socket.to(roomId).emit("user-joined", {
        user: username,
        message: `${username} joined`,
      });
    });

    /// 🔥 LEAVE ROOM
    socket.on("leave-room", ({ roomId, username }) => {
      socket.leave(roomId);

      console.log(`🚪 ${username} left room: ${roomId}`);

      socket.to(roomId).emit("user-left", {
        user: username,
        message: `${username} left`,
      });
    });

    /// 💬 SEND MESSAGE
    socket.on("send-message", ({ roomId, message, user }) => {
      if (!roomId || !message || !user) return;

      // io.to(roomId).emit("receive-message", {
      io.to(roomId).emit("receive-message", {
        user,
        message,
        time: new Date(),
      });
    });

    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};