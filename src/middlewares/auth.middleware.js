import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    console.log("AUTH HEADER:", auth);

    const token = auth?.split(" ")[1];
    console.log("TOKEN:", token);

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    

    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    console.log("DECODED:", decoded);
    req.user = user;

    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message); 
    return res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};


export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }
  next();
};