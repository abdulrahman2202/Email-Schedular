import { Router } from "express";
import { Request, Response } from "express";
import {
  scheduleEmailsController,
  getScheduledEmails,
  getSentEmails,
  getEmailById,
} from "../controllers/email.controller";
import { searchEmails } from "../services/search.service";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/api/emails/schedule", authenticate, scheduleEmailsController);
router.get("/api/emails/scheduled", authenticate, getScheduledEmails);
router.get("/api/emails/sent", authenticate, getSentEmails);

router.get("/api/emails/search", authenticate, async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string | undefined;
    if (!q || q.trim().length === 0) {
      res.status(400).json({ success: false, message: "Query parameter 'q' is required" });
      return;
    }

    const emails = await searchEmails(q, req.user!.userId);
    res.json({ success: true, query: q, emails });
  } catch (error) {
    console.error("[SearchController] Search error:", error);
    res.status(503).json({
      success: false,
      message: "Search service temporarily unavailable",
    });
  }
});

router.get("/api/emails/:id", authenticate, getEmailById);

export default router;
