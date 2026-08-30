"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureIndex = ensureIndex;
exports.indexEmail = indexEmail;
exports.updateEmailStatus = updateEmailStatus;
exports.searchEmails = searchEmails;
const elasticsearch_1 = require("../config/elasticsearch");
const INDEX_NAME = "emails";
async function ensureIndex() {
    try {
        const exists = await elasticsearch_1.client.indices.exists({ index: INDEX_NAME });
        if (!exists) {
            await elasticsearch_1.client.indices.create({
                index: INDEX_NAME,
                mappings: {
                    properties: {
                        id: { type: "keyword" },
                        userId: { type: "keyword" },
                        senderId: { type: "keyword" },
                        recipient: { type: "text", fields: { keyword: { type: "keyword" } } },
                        subject: { type: "text" },
                        body: { type: "text" },
                        status: { type: "keyword" },
                        scheduledAt: { type: "date" },
                        sentAt: { type: "date" },
                        createdAt: { type: "date" },
                    },
                },
            });
            console.log("[Elasticsearch] Index 'emails' created");
        }
    }
    catch (err) {
        console.error("[Elasticsearch] Index creation failed (non-fatal):", err instanceof Error ? err.message : err);
    }
}
async function indexEmail(doc) {
    try {
        await elasticsearch_1.client.index({
            index: INDEX_NAME,
            id: doc.id,
            document: {
                userId: doc.userId,
                senderId: doc.senderId,
                recipient: doc.recipient,
                subject: doc.subject,
                body: doc.body,
                status: doc.status,
                scheduledAt: doc.scheduledAt,
                sentAt: doc.sentAt,
                createdAt: doc.createdAt,
            },
        });
    }
    catch (err) {
        console.error("[Elasticsearch] Index email failed (non-fatal):", err instanceof Error ? err.message : err);
    }
}
async function updateEmailStatus(emailId, status, sentAt, messageId) {
    try {
        await elasticsearch_1.client.update({
            index: INDEX_NAME,
            id: emailId,
            doc: { status, sentAt, messageId },
        });
    }
    catch (err) {
        console.error("[Elasticsearch] Update email status failed (non-fatal):", err instanceof Error ? err.message : err);
    }
}
async function searchEmails(query, userId) {
    try {
        const result = await elasticsearch_1.client.search({
            index: INDEX_NAME,
            query: {
                bool: {
                    must: [
                        {
                            multi_match: {
                                query,
                                fields: ["recipient", "subject", "body"],
                            },
                        },
                    ],
                    filter: [{ term: { userId } }],
                },
            },
        });
        return result.hits.hits.map((hit) => {
            const src = hit._source;
            return {
                id: hit._id,
                ...src,
            };
        });
    }
    catch (err) {
        console.error("[Elasticsearch] Search failed:", err instanceof Error ? err.message : err);
        throw err;
    }
}
//# sourceMappingURL=search.service.js.map