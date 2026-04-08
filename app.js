import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
// dotenv.config();

import express from "express";
import cors from "cors";
import http from "http";
import { initSocket } from "./src/socket/socket.js";

import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import streamRoutes from "./src/routes/stream.routes.js";


const app = express();
const HOST = '116.202.210.102';

app.use(cors({
  origin: "*", 
}));


console.log("ENV CHECK:", process.env.CLOUD_NAME);

// Middleware
app.use(express.json());


app.get("/", (req, res) => {
  res.json({message : "hey"})
})

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stream", streamRoutes);

// DB
await connectDB();

const server = http.createServer(app);

initSocket(server);

// Server
const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });

server.listen(PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});