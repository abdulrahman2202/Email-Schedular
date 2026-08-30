import { Request, Response, Router } from "express";
import { searchEmails } from "../services/search.service";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

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

export default router;
