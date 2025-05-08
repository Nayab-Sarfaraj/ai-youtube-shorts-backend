import express from "express";
import authRoutes from "./auth.routes.js";
import VideoRoutes from "./video.routes.js";
import CreditRoutes from "./credit.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/videos", VideoRoutes);
router.use("/credits", CreditRoutes);


export default router;
