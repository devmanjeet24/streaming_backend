import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";

import { initSocket } from "./src/sockets/index.js";

import connectDB from "./src/config/db.js";

// ROUTES
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import streamerRoutes from "./src/routes/streamer.routes.js";
import walletRoutes from "./src/routes/wallet.routes.js";
import messageRoutes from "./src/routes/message.routes.js";
import giftRoutes from "./src/routes/gift.routes.js";

// ✅ FIXED
const app = express();
const server = http.createServer(app);

// ✅ SOCKET INIT
initSocket(server);

// Middleware
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/streamers", streamerRoutes);
app.use("/wallet", walletRoutes);
app.use("/messages", messageRoutes);
app.use("/gifts", giftRoutes);

// DB
await connectDB();

// Server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});