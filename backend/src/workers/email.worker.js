"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.worker = void 0;
const bullmq_1 = require("bullmq");
const nodemailer_1 = __importDefault(require("nodemailer"));
const redis_1 = require("../config/redis");
const prisma_1 = require("../config/prisma");
const ethereal_1 = require("../config/ethereal");
const rate_limit_1 = require("../utils/rate-limit");
const slack_service_1 = require("../services/slack.service");
const search_service_1 = require("../services/search.service");
const concurrency = Number(process.env.WORKER_CONCURRENCY) || 5;
const worker = new bullmq_1.Worker("email-send", async (job) => {
    const { emailId } = job.data;
    console.log(`[Worker] Email job started | jobId=${job.id} emailId=${emailId}`);
    const email = await prisma_1.prisma.email.findUnique({ where: { id: emailId } });
    if (!email) {
        throw new Error(`Email ${emailId} not found`);
    }
    // Idempotency: skip if already sent
    if (email.status === "sent") {
        console.log(`[Worker] Email already sent, skipping | jobId=${job.id} emailId=${emailId}`);
        return { skipped: true };
    }
    // Rate limiting check
    const allowed = await (0, rate_limit_1.checkAndIncrementRateLimit)(email.senderId);
    if (!allowed) {
        console.log(`[Worker] Rate limited | jobId=${job.id} emailId=${emailId} senderId=${email.senderId}`);
        // Reschedule to next hourly window
        const delayMs = (0, rate_limit_1.getNextWindowDelay)();
        const nextTime = new Date(Date.now() + delayMs);
        await prisma_1.prisma.email.update({
            where: { id: emailId },
            data: { scheduledAt: nextTime },
        });
        // Move job to delayed state
        await job.moveToDelayed(nextTime.getTime());
        // Slack notification (idempotent per hour window)
        const notifKey = `slack-rate-notified:${email.senderId}:${(0, rate_limit_1.getHourWindow)()}`;
        const alreadyNotified = await redis_1.redis.exists(notifKey);
        if (!alreadyNotified) {
            const sender = await prisma_1.prisma.sender.findUnique({ where: { id: email.senderId } });
            if (sender) {
                const maxPerHour = process.env.MAX_EMAILS_PER_HOUR || "50";
                const message = `ReachInbox rate limit reached: ${sender.email} has reached the hourly limit of ${maxPerHour} emails. Remaining emails have been rescheduled.`;
                await (0, slack_service_1.sendSlackNotification)(email.userId, message);
            }
            await redis_1.redis.set(notifKey, "1", "EX", 3600);
        }
        return { rescheduled: true };
    }
    // Mark as processing
    await prisma_1.prisma.email.update({
        where: { id: emailId },
        data: { status: "processing" },
    });
    // Load sender
    const sender = await prisma_1.prisma.sender.findUnique({ where: { id: email.senderId } });
    if (!sender) {
        await prisma_1.prisma.email.update({
            where: { id: emailId },
            data: { status: "failed", error: "Sender not found" },
        });
        throw new Error(`Sender ${email.senderId} not found for email ${emailId}`);
    }
    // Send via Ethereal
    const transporter = await (0, ethereal_1.getTransporter)();
    const info = await transporter.sendMail({
        from: sender.smtpUser || sender.email,
        to: email.recipient,
        subject: email.subject,
        html: email.body,
    });
    const previewUrl = info.messageId
        ? nodemailer_1.default.getTestMessageUrl(info)
        : undefined;
    console.log(`[Worker] Email sent | jobId=${job.id} emailId=${emailId} recipient=${email.recipient} messageId=${info.messageId}`);
    if (previewUrl) {
        console.log(`[Worker] Preview URL: ${previewUrl}`);
    }
    // Update DB
    const sentAt = new Date();
    await prisma_1.prisma.email.update({
        where: { id: emailId },
        data: {
            status: "sent",
            sentAt,
            messageId: info.messageId || null,
        },
    });
    // Update Elasticsearch
    await (0, search_service_1.updateEmailStatus)(emailId, "sent", sentAt.toISOString(), info.messageId || null);
    return { sent: true, messageId: info.messageId, previewUrl };
}, {
    connection: redis_1.redis,
    concurrency,
});
exports.worker = worker;
worker.on("failed", (job, err) => {
    const emailId = job?.data?.emailId || "unknown";
    console.error(`[Worker] Email failed | jobId=${job?.id} emailId=${emailId} error=${err.message}`);
});
worker.on("completed", (job) => {
    const result = job.returnvalue;
    if (result?.skipped) {
        console.log(`[Worker] Job completed (skipped) | jobId=${job.id}`);
    }
    else if (result?.rescheduled) {
        console.log(`[Worker] Job rescheduled (rate limited) | jobId=${job.id}`);
    }
});
//# sourceMappingURL=email.worker.js.map