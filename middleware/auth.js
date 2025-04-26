import jwt from "jsonwebtoken";
import User from "../schema/UserSchema.js";
export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedData.userId);
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
