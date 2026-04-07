import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    const auth = req.headers.authorization;
    console.log("AUTH HEADER:", auth);

    const token = auth?.split(" ")[1];
    console.log("TOKEN:", token);

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    console.log("SECRET:", process.env.ACCESS_SECRET);

    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    console.log("DECODED:", decoded);
    req.user = decoded;

    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message); // 👈 THIS WILL REVEAL TRUTH
    return res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};