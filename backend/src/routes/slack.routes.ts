import { Router } from "express";
import {
  slackConnect,
  slackCallback,
  slackStatus,
  slackDisconnect,
} from "../controllers/slack.controller";

const router = Router();

router.get("/api/slack/connect", slackConnect);
router.get("/api/slack/callback", slackCallback);
router.get("/api/slack/status", slackStatus);
router.post("/api/slack/disconnect", slackDisconnect);

export default router;
