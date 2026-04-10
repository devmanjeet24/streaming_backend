import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });


  const rooms = {};
  const streamers = {};

  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    /// 🔥 JOIN ROOM
    socket.on("join-room", ({ roomId, username, isStreamer, avatar }) => {
      if (!roomId || !username) return;

      socket.join(roomId);

      /// 👀 VIEWER COUNT
      if (!rooms[roomId]) rooms[roomId] = 0;
      rooms[roomId]++;

      /// 🎥 STREAMER TRACK
      const isStreamerUser = isStreamer === true;

      if (isStreamerUser) {
        streamers[roomId] = {
          username,
          viewers: rooms[roomId],
          roomId,
          socketId: socket.id,
          avatar: avatar ?? "",
        };

        console.log("🔥 STREAMER ADDED:", streamers[roomId]);
        console.log("📡 ALL STREAMERS:", streamers);
      }

      console.log("📡 ALL STREAMERS:", streamers);

      /// 🔥 SEND DATA
      io.to(roomId).emit("viewer-count", rooms[roomId]);

      io.emit("live-streamers", Object.values(streamers));

      socket.to(roomId).emit("user-joined", {
        user: username,
        message: `${username} joined`,
      });

      console.log(` ${username} joined ${roomId}`);
    });

    socket.on("get-live-streamers", () => {
      socket.emit("live-streamers", Object.values(streamers));
    });

    ///  MESSAGE
    socket.on("send-message", ({ roomId, message, user }) => {
      io.to(roomId).emit("receive-message", {
        user,
        message,
        time: new Date(),
      });
    });

    ///  LIKE
    socket.on("send-like", ({ roomId }) => {
      io.to(roomId).emit("receive-like");
    });

    socket.on("send-reaction", ({ roomId, type }) => {
      io.to(roomId).emit("receive-reaction", { type });
    });

    ///  DISCONNECT
    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);

      // viewer count update
      for (let roomId in rooms) {
        rooms[roomId] = Math.max(0, rooms[roomId] - 1);
        io.to(roomId).emit("viewer-count", rooms[roomId]);
      }

      // streamer remove — rooms loop se BAHAR
      for (let roomId in streamers) {
        if (streamers[roomId].socketId === socket.id) {
          delete streamers[roomId];
          console.log("🗑 Streamer removed:", roomId);
          io.emit("live-streamers", Object.values(streamers));
        }
      }
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};