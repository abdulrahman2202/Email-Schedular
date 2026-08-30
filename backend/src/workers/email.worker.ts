import { Worker, Job } from "bullmq";
import nodemailer from "nodemailer";
import { redis } from "../config/redis";
import { prisma } from "../config/prisma";
import { getTransporter } from "../config/ethereal";
import { checkAndIncrementRateLimit, getNextWindowDelay, getHourWindow } from "../utils/rate-limit";
import { sendSlackNotification } from "../services/slack.service";
import { updateEmailStatus } from "../services/search.service";

const concurrency = Number(process.env.WORKER_CONCURRENCY) || 5;

const worker = new Worker(
  "email-send",
  async (job: Job) => {
    const { emailId } = job.data as { emailId: string };

    console.log(`[Worker] Email job started | jobId=${job.id} emailId=${emailId}`);

    const email = await prisma.email.findUnique({ where: { id: emailId } });

    if (!email) {
      throw new Error(`Email ${emailId} not found`);
    }

    // Idempotency: skip if already sent
    if (email.status === "sent") {
      console.log(`[Worker] Email already sent, skipping | jobId=${job.id} emailId=${emailId}`);
      return { skipped: true };
    }

    // Rate limiting check
    const allowed = await checkAndIncrementRateLimit(email.senderId);
    if (!allowed) {
      console.log(`[Worker] Rate limited | jobId=${job.id} emailId=${emailId} senderId=${email.senderId}`);

      // Reschedule to next hourly window
      const delayMs = getNextWindowDelay();
      const nextTime = new Date(Date.now() + delayMs);

      await prisma.email.update({
        where: { id: emailId },
        data: { scheduledAt: nextTime },
      });

      // Move job to delayed state
      await job.moveToDelayed(nextTime.getTime());

      // Slack notification (idempotent per hour window)
      const notifKey = `slack-rate-notified:${email.senderId}:${getHourWindow()}`;
      const alreadyNotified = await redis.exists(notifKey);
      if (!alreadyNotified) {
        const sender = await prisma.sender.findUnique({ where: { id: email.senderId } });
        if (sender) {
          const maxPerHour = process.env.MAX_EMAILS_PER_HOUR || "50";
          const message =
            `ReachInbox rate limit reached: ${sender.email} has reached the hourly limit of ${maxPerHour} emails. Remaining emails have been rescheduled.`;
          await sendSlackNotification(email.userId, message);
        }
        await redis.set(notifKey, "1", "EX", 3600);
      }

      return { rescheduled: true };
    }

    // Mark as processing
    await prisma.email.update({
      where: { id: emailId },
      data: { status: "processing" },
    });

    // Load sender
    const sender = await prisma.sender.findUnique({ where: { id: email.senderId } });
    if (!sender) {
      await prisma.email.update({
        where: { id: emailId },
        data: { status: "failed", error: "Sender not found" },
      });
      throw new Error(`Sender ${email.senderId} not found for email ${emailId}`);
    }

    // Send via Ethereal
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: sender.smtpUser || sender.email,
      to: email.recipient,
      subject: email.subject,
      html: email.body,
    });

    const previewUrl = info.messageId
      ? nodemailer.getTestMessageUrl(info)
      : undefined;

    console.log(
      `[Worker] Email sent | jobId=${job.id} emailId=${emailId} recipient=${email.recipient} messageId=${info.messageId}`
    );
    if (previewUrl) {
      console.log(`[Worker] Preview URL: ${previewUrl}`);
    }

    // Update DB
    const sentAt = new Date();
    await prisma.email.update({
      where: { id: emailId },
      data: {
        status: "sent",
        sentAt,
        messageId: info.messageId || null,
      },
    });

    // Update Elasticsearch
    await updateEmailStatus(emailId, "sent", sentAt.toISOString(), info.messageId || null);

    return { sent: true, messageId: info.messageId, previewUrl };
  },
  {
    connection: redis,
    concurrency,
  }
);

worker.on("failed", (job, err) => {
  const emailId = job?.data?.emailId || "unknown";
  console.error(`[Worker] Email failed | jobId=${job?.id} emailId=${emailId} error=${err.message}`);
});

worker.on("completed", (job) => {
  const result = job.returnvalue as { skipped?: boolean; sent?: boolean; rescheduled?: boolean } | undefined;
  if (result?.skipped) {
    console.log(`[Worker] Job completed (skipped) | jobId=${job.id}`);
  } else if (result?.rescheduled) {
    console.log(`[Worker] Job rescheduled (rate limited) | jobId=${job.id}`);
  }
});

export { worker };
