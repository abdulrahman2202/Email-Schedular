interface ScheduleEmailsInput {
    userId: string;
    senderId: string;
    subject: string;
    body: string;
    recipients: string[];
    startTime: Date;
    delayBetweenEmails: number;
}
export declare function scheduleEmails(input: ScheduleEmailsInput): Promise<{
    error: string | null;
    id: string;
    createdAt: Date;
    userId: string;
    senderId: string;
    recipient: string;
    subject: string;
    body: string;
    scheduledAt: Date;
    sentAt: Date | null;
    status: string;
    messageId: string | null;
}[]>;
export {};
//# sourceMappingURL=email.service.d.ts.map