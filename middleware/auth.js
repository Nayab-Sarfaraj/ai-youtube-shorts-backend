import jwt from "jsonwebtoken";
import User from "../schema/UserSchema.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedData.userId);
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = user;

    // ✅ Wrap res.json to inject credits
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      if (typeof data === "object" && data !== null) {
        data.credits = user.credits;  // Add credits field
      }
      return originalJson(data);
    };

    next();
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
