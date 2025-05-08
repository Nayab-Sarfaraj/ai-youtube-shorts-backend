import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { grantCredit } from "../controllers/credits.controller.js";
const router = Router();


router.post("/", isAuthenticated, grantCredit);

export default router;
