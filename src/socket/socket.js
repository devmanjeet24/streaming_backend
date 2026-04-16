import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  const rooms = {};       
  const streamers = {};   
  const reactions = {};   // roomId → { likes, dislikes }
  const socketRooms = {}; // socketId → roomId (track karo kaun kahan hai)

  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);

    // ✅ JOIN ROOM
    socket.on("join-room", ({ roomId, username, isStreamer, avatar }) => {
      if (!roomId || !username) return;

      socket.join(roomId);
      socketRooms[socket.id] = { roomId, username, isStreamer: isStreamer === true };

      if (!rooms[roomId]) rooms[roomId] = 0;

      if (isStreamer === true) {
        // Streamer join
        streamers[roomId] = {
          username,
          viewers: 0,
          roomId,
          socketId: socket.id,
          avatar: avatar ?? "",
        };
        console.log("🎥 Streamer joined:", username, roomId);
      } else {
        // Viewer join
        rooms[roomId]++;
        if (streamers[roomId]) {
          streamers[roomId].viewers = rooms[roomId];
        }
        console.log("👀 Viewer joined:", username, "viewers:", rooms[roomId]);
      }

      // Viewer count us room ko
      io.to(roomId).emit("viewer-count", rooms[roomId]);

      // Updated streamer list sab ko
      io.emit("live-streamers", Object.values(streamers));

      socket.to(roomId).emit("user-joined", { user: username });
    });

    // ✅ LEAVE ROOM
    socket.on("leave-room", ({ roomId, username }) => {
      if (!roomId) return;

      socket.leave(roomId);
      delete socketRooms[socket.id];

      if (streamers[roomId] && streamers[roomId].username === username) {
        // Streamer ne leave kiya
        delete streamers[roomId];
        delete rooms[roomId];
        delete reactions[roomId];
        console.log("🗑 Streamer left:", roomId);
        io.emit("streamer-offline", { roomId });
        io.emit("live-streamers", Object.values(streamers));
      } else {
        // Viewer ne leave kiya
        if (rooms[roomId] !== undefined) {
          rooms[roomId] = Math.max(0, rooms[roomId] - 1);
          if (streamers[roomId]) {
            streamers[roomId].viewers = rooms[roomId];
            io.emit("live-streamers", Object.values(streamers));
          }
          io.to(roomId).emit("viewer-count", rooms[roomId]);
        }
      }

      socket.to(roomId).emit("user-left", { user: username });
      console.log(`👋 ${username} left ${roomId}`);
    });

    // ✅ GET LIVE STREAMERS
    socket.on("get-live-streamers", () => {
      socket.emit("live-streamers", Object.values(streamers));
    });

    // ✅ MESSAGE
    socket.on("send-message", ({ roomId, message, user }) => {
      io.to(roomId).emit("receive-message", { user, message, time: new Date() });
    });

    // ✅ REACTION (like/dislike)
    socket.on("send-reaction", ({ roomId, type }) => {
      if (!reactions[roomId]) {
        reactions[roomId] = { likes: 0, dislikes: 0 };
      }
      if (type === "like") {
        reactions[roomId].likes++;
      } else {
        reactions[roomId].dislikes++;
      }
      io.to(roomId).emit("receive-reaction", {
        type,
        likes: reactions[roomId].likes,
        dislikes: reactions[roomId].dislikes,
      });
    });

    // ✅ DISCONNECT
    socket.on("disconnect", () => {
      console.log("🔴 Disconnected:", socket.id);

      const info = socketRooms[socket.id];
      if (!info) return;

      const { roomId, username, isStreamer } = info;
      delete socketRooms[socket.id];

      if (isStreamer) {
        // Streamer disconnect
        delete streamers[roomId];
        delete rooms[roomId];
        delete reactions[roomId];
        console.log("🗑 Streamer removed:", roomId);
        io.emit("streamer-offline", { roomId });
        io.emit("live-streamers", Object.values(streamers));
      } else {
        // Viewer disconnect
        if (rooms[roomId] !== undefined) {
          rooms[roomId] = Math.max(0, rooms[roomId] - 1);
          if (streamers[roomId]) {
            streamers[roomId].viewers = rooms[roomId];
            io.emit("live-streamers", Object.values(streamers));
          }
          io.to(roomId).emit("viewer-count", rooms[roomId]);
        }
      }
    });
  });
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};