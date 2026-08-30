interface EmailDocument {
    id: string;
    userId: string;
    senderId: string;
    recipient: string;
    subject: string;
    body: string;
    status: string;
    scheduledAt: string;
    sentAt: string | null;
    createdAt: string;
}
export declare function ensureIndex(): Promise<void>;
export declare function indexEmail(doc: EmailDocument): Promise<void>;
export declare function updateEmailStatus(emailId: string, status: string, sentAt: string | null, messageId: string | null): Promise<void>;
export declare function searchEmails(query: string, userId: string): Promise<{
    id: string | undefined;
}[]>;
export {};
//# sourceMappingURL=search.service.d.ts.map