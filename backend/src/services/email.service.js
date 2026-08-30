"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleEmails = scheduleEmails;
const prisma_1 = require("../config/prisma");
const email_queue_1 = require("../queues/email.queue");
const search_service_1 = require("./search.service");
async function scheduleEmails(input) {
    const { userId, senderId, subject, body, recipients, startTime, delayBetweenEmails } = input;
    const emails = await prisma_1.prisma.$transaction(async (tx) => {
        const created = [];
        for (let i = 0; i < recipients.length; i++) {
            const scheduledAt = new Date(startTime.getTime() + delayBetweenEmails * i);
            const email = await tx.email.create({
                data: {
                    userId,
                    senderId,
                    recipient: recipients[i],
                    subject,
                    body,
                    scheduledAt,
                    status: "scheduled",
                },
            });
            const delayMs = Math.max(0, scheduledAt.getTime() - Date.now());
            await email_queue_1.emailQueue.add("send-email", { emailId: email.id }, {
                jobId: `email-${email.id}`,
                delay: delayMs,
            });
            created.push(email);
        }
        return created;
    });
    // Index emails in Elasticsearch (non-fatal)
    for (const email of emails) {
        await (0, search_service_1.indexEmail)({
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
//# sourceMappingURL=email.service.js.map