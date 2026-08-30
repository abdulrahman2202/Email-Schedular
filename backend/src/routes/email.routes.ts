import { Router } from "express";
import {
  scheduleEmailsController,
  getScheduledEmails,
  getSentEmails,
} from "../controllers/email.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/api/emails/schedule", authenticate, scheduleEmailsController);
router.get("/api/emails/scheduled", authenticate, getScheduledEmails);
router.get("/api/emails/sent", authenticate, getSentEmails);

export default router;
