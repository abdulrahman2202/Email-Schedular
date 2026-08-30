"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleEmailsController = scheduleEmailsController;
exports.getScheduledEmails = getScheduledEmails;
exports.getSentEmails = getSentEmails;
exports.getEmailById = getEmailById;
exports.deleteEmail = deleteEmail;
const zod_1 = require("zod");
const prisma_1 = require("../config/prisma");
const email_service_1 = require("../services/email.service");
const email_queue_1 = require("../queues/email.queue");
const scheduleSchema = zod_1.z.object({
    senderId: zod_1.z.string().trim().min(1, "senderId is required"),
    subject: zod_1.z.string().trim().min(1, "subject is required"),
    body: zod_1.z.string().trim().min(1, "body is required"),
    recipients: zod_1.z.array(zod_1.z.email()).min(1, "At least one recipient is required"),
    startTime: zod_1.z.coerce.date(),
    delayBetweenEmails: zod_1.z.number().min(0),
});
async function scheduleEmailsController(req, res) {
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
        const userId = req.user.userId;
        // Verify sender exists and belongs to user
        const sender = await prisma_1.prisma.sender.findFirst({
            where: { id: senderId, userId },
        });
        if (!sender) {
            res.status(404).json({
                success: false,
                message: "Sender not found",
            });
            return;
        }
        const emails = await (0, email_service_1.scheduleEmails)({
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
    }
    catch (error) {
        console.error("[EmailController] Schedule error:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function getScheduledEmails(req, res) {
    try {
        const userId = req.user.userId;
        const emails = await prisma_1.prisma.email.findMany({
            where: { status: "scheduled", userId },
            orderBy: { scheduledAt: "asc" },
        });
        res.json({ success: true, emails });
    }
    catch (error) {
        console.error("[EmailController] Get scheduled error:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function getSentEmails(req, res) {
    try {
        const userId = req.user.userId;
        const emails = await prisma_1.prisma.email.findMany({
            where: { status: "sent", userId },
            orderBy: { sentAt: "desc" },
        });
        res.json({ success: true, emails });
    }
    catch (error) {
        console.error("[EmailController] Get sent error:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function getEmailById(req, res) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const email = await prisma_1.prisma.email.findFirst({
            where: { id, userId },
            include: { sender: { select: { id: true, email: true, smtpUser: true } } },
        });
        if (!email) {
            res.status(404).json({ success: false, message: "Email not found" });
            return;
        }
        res.json({ success: true, email });
    }
    catch (error) {
        console.error("[EmailController] Get email by id error:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function deleteEmail(req, res) {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const email = await prisma_1.prisma.email.findFirst({
            where: { id, userId },
        });
        if (!email) {
            res.status(404).json({ success: false, message: "Email not found" });
            return;
        }
        // Cancel the BullMQ job if scheduled (still delayed/waiting)
        if (email.status === "scheduled") {
            try {
                const jobId = `email-${email.id}`;
                await email_queue_1.emailQueue.remove(jobId);
            }
            catch (e) {
                // Job may already be completed or not found — that's fine
                console.log("[EmailController] Could not cancel BullMQ job (may already be processed):", e.message);
            }
        }
        await prisma_1.prisma.email.delete({ where: { id } });
        res.json({ success: true, message: "Email deleted successfully" });
    }
    catch (error) {
        console.error("[EmailController] Delete email error:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
//# sourceMappingURL=email.controller.js.map