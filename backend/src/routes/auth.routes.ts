import { Router } from "express";
import { googleAuth, googleCallback, getMe, logout } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/me", authenticate, getMe);
router.post("/logout", logout);

export default router;
