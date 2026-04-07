import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
// dotenv.config();

import express from "express";
import cors from "cors";

import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";


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

// DB
await connectDB();

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});