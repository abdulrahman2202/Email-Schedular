import { prisma } from "../config/prisma";
import { emailQueue } from "../queues/email.queue";
import { indexEmail } from "./search.service";

interface ScheduleEmailsInput {
  userId: string;
  senderId: string;
  subject: string;
  body: string;
  recipients: string[];
  startTime: Date;
  delayBetweenEmails: number;
}

export async function scheduleEmails(input: ScheduleEmailsInput) {
  const { userId, senderId, subject, body, recipients, startTime, delayBetweenEmails } = input;

  const emails = await prisma.$transaction(async (tx) => {
    const created = [];
    for (let i = 0; i < recipients.length; i++) {
      const scheduledAt = new Date(startTime.getTime() + delayBetweenEmails * i);

      const email = await tx.email.create({
        data: {
          userId,
          senderId,
          recipient: recipients[i]!,
          subject,
          body,
          scheduledAt,
          status: "scheduled",
        },
      });

      const delayMs = Math.max(0, scheduledAt.getTime() - Date.now());

      await emailQueue.add(
        "send-email",
        { emailId: email.id },
        {
          jobId: `email-${email.id}`,
          delay: delayMs,
        }
      );

      created.push(email);
    }
    return created;
  });

  // Index emails in Elasticsearch (non-fatal)
  for (const email of emails) {
    await indexEmail({
      id: email.id,
      userId: email.userId,
      senderId: email.senderId,
      recipient: email.recipient,
      subject: email.subject,
      body: email.body,
      status: email.status,
      scheduledAt: email.scheduledAt.toISOString(),
      sentAt: email.sentAt?.toISOString() ?? null,
      createdAt: email.createdAt.toISOString(),
    });
  }

  return emails;
}
