import { Router } from "express";
import {
  scheduleEmailsController,
  getScheduledEmails,
  getSentEmails,
} from "../controllers/email.controller";

const router = Router();

router.post("/api/emails/schedule", scheduleEmailsController);
router.get("/api/emails/scheduled", getScheduledEmails);
router.get("/api/emails/sent", getSentEmails);

export default router;
