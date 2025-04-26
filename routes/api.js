import express from "express";
import authRoutes from "./auth.routes.js";
import VideoRoutes from "./video.routes.js";
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/videos", VideoRoutes);

export default router;
