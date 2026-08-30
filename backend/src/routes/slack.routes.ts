import { Router } from "express";
import {
  slackConnect,
  slackCallback,
  slackStatus,
  slackDisconnect,
} from "../controllers/slack.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/api/slack/connect", authenticate, slackConnect);
router.get("/api/slack/callback", slackCallback);
router.get("/api/slack/status", authenticate, slackStatus);
router.post("/api/slack/disconnect", authenticate, slackDisconnect);

export default router;
