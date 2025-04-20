import express from "express";
import { register, login } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", register);
router.post("/signin", login);

// forgot password
// router.post("/send-otp", sendOTP);

export default router;
