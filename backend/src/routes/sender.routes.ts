import { Request, Response, Router } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

const createSenderSchema = z.object({
  email: z.email("Invalid email address"),
  smtpUser: z.string().trim().min(1, "smtpUser is required"),
  smtpPassword: z.string().trim().min(1, "smtpPassword is required"),
});

router.get("/api/senders", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const senders = await prisma.sender.findMany({
      where: { userId },
      select: {
        id: true,
        email: true,
        smtpUser: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, senders });
  } catch (error) {
    console.error("[SenderController] List error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

router.post("/api/senders", authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createSenderSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.issues,
      });
      return;
    }

    const userId = req.user!.userId;

    const sender = await prisma.sender.create({
      data: {
        userId,
        email: parsed.data.email,
        smtpUser: parsed.data.smtpUser,
        smtpPassword: parsed.data.smtpPassword,
      },
      select: {
        id: true,
        email: true,
        smtpUser: true,
        createdAt: true,
      },
    });

    res.status(201).json({ success: true, sender });
  } catch (error) {
    console.error("[SenderController] Create error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
});

export default router;
