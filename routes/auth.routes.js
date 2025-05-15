import express from "express";
import { register, login, getMe, updatePushToken } from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", register);
router.post("/signin", login);
router.get("/me", isAuthenticated, getMe);
router.post("/update-push-token", isAuthenticated, updatePushToken);


// forgot password
// router.post("/send-otp", sendOTP);

export default router;
