import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import express from "express";
import cors from "cors";
import http from "http";
import { initSocket } from "./src/socket/socket.js";
import connectDB from "./src/config/db.js";
import { seedGifts } from "./src/config/gifts.js";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import streamRoutes from "./src/routes/stream.routes.js";
import coinRoutes from "./src/routes/coin.routes.js";
import giftRoutes from "./src/routes/gift.routes.js";

const app = express();

app.use(cors({ origin: "*" }));

console.log("ENV CHECK:", process.env.CLOUD_NAME);

// ✅ Webhook PEHLE — raw body chahiye, express.json() se pehle
app.use("/api/coins/webhook", express.raw({ type: "application/json" }));

// Middleware
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "hey" }));

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stream", streamRoutes);
app.use("/api/coins", coinRoutes);
app.use("/api/gifts", giftRoutes);

await connectDB();
await seedGifts();

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});