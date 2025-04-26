import { Router } from "express";
import {
  generateVideoContent,
  getVideoDetails,
  getVideos,
} from "../controllers/video.controller.js";
import { isAuthenticated } from "../middleware/auth.js";
const router = Router();
router.get("/", isAuthenticated, getVideos);
router.get("/get-details/:id", isAuthenticated, getVideoDetails);
router.post("/gen-video", isAuthenticated, generateVideoContent);
export default router;
