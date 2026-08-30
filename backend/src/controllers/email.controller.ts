import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { scheduleEmails } from "../services/email.service";

const scheduleSchema = z.object({
  senderId: z.string().trim().min(1, "senderId is required"),
  subject: z.string().trim().min(1, "subject is required"),
  body: z.string().trim().min(1, "body is required"),
  recipients: z.array(z.email()).min(1, "At least one recipient is required"),
  startTime: z.coerce.date(),
  delayBetweenEmails: z.number().min(0),
});

export async function scheduleEmailsController(req: Request, res: Response) {
  try {
    const parsed = scheduleSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.issues,
      });
      return;
    }

    const { senderId, subject, body, recipients, startTime, delayBetweenEmails } = parsed.data;

    const minDelay = Number(process.env.MIN_SEND_DELAY_MS) || 2000;
    const effectiveDelay = Math.max(delayBetweenEmails, minDelay);

    // Use authenticated user
    const userId = req.user!.userId;

    // Verify sender exists and belongs to user
    const sender = await prisma.sender.findFirst({
      where: { id: senderId, userId },
    });
    if (!sender) {
      res.status(404).json({
        success: false,
        message: "Sender not found",
      });
      return;
    }

    const emails = await scheduleEmails({
      userId,
      senderId,
      subject,
      body,
      recipients,
      startTime,
      delayBetweenEmails: effectiveDelay,
    });

    res.status(201).json({
      success: true,
      message: "Emails scheduled successfully",
      count: emails.length,
      emails,
    });
  } catch (error) {
    console.error("[EmailController] Schedule error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

export async function getScheduledEmails(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const emails = await prisma.email.findMany({
      where: { status: "scheduled", userId },
      orderBy: { scheduledAt: "asc" },
    });

    res.json({ success: true, emails });
  } catch (error) {
    console.error("[EmailController] Get scheduled error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

export async function getSentEmails(req: Request, res: Response) {
  try {
    const userId = req.user!.userId;
    const emails = await prisma.email.findMany({
      where: { status: "sent", userId },
      orderBy: { sentAt: "desc" },
    });

    res.json({ success: true, emails });
  } catch (error) {
    console.error("[EmailController] Get sent error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

export async function getEmailById(req: Request<{ id: string }>, res: Response) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const email = await prisma.email.findFirst({
      where: { id, userId },
      include: { sender: { select: { id: true, email: true, smtpUser: true } } },
    });

    if (!email) {
      res.status(404).json({ success: false, message: "Email not found" });
      return;
    }

    res.json({ success: true, email });
  } catch (error) {
    console.error("[EmailController] Get email by id error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
