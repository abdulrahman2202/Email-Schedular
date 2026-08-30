import { Request, Response, Router } from "express";
import { searchEmails } from "../services/search.service";

const router = Router();

router.get("/api/emails/search", async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string | undefined;
    if (!q || q.trim().length === 0) {
      res.status(400).json({ success: false, message: "Query parameter 'q' is required" });
      return;
    }

    const emails = await searchEmails(q);
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
