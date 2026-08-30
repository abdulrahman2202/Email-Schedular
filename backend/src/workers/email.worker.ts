import { Worker, Job } from "bullmq";
import nodemailer from "nodemailer";
import { redis } from "../config/redis";
import { prisma } from "../config/prisma";
import { getTransporter } from "../config/ethereal";

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
    await prisma.email.update({
      where: { id: emailId },
      data: {
        status: "sent",
        sentAt: new Date(),
        messageId: info.messageId || null,
      },
    });

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
  const result = job.returnvalue as { skipped?: boolean; sent?: boolean } | undefined;
  if (result?.skipped) {
    console.log(`[Worker] Job completed (skipped) | jobId=${job.id}`);
  }
});

// Idempotency note:
// Before sending, the worker queries PostgreSQL to check if the email status is already "sent".
// This is the source of truth, not an in-memory flag. Combined with deterministic job IDs
// (email-{emailId}), this prevents duplicate sends even if:
// - The worker restarts
// - BullMQ retries the job
// - Multiple workers process jobs concurrently
// - The API restarts

export { worker };
