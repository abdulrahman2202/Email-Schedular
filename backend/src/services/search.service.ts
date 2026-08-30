import { client } from "../config/elasticsearch";

const INDEX_NAME = "emails";

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

export async function ensureIndex(): Promise<void> {
  try {
    const exists = await client.indices.exists({ index: INDEX_NAME });
    if (!exists) {
      await client.indices.create({
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
  } catch (err) {
    console.error("[Elasticsearch] Index creation failed (non-fatal):", err instanceof Error ? err.message : err);
  }
}

export async function indexEmail(doc: EmailDocument): Promise<void> {
  try {
    await client.index({
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
  } catch (err) {
    console.error("[Elasticsearch] Index email failed (non-fatal):", err instanceof Error ? err.message : err);
  }
}

export async function updateEmailStatus(
  emailId: string,
  status: string,
  sentAt: string | null,
  messageId: string | null
): Promise<void> {
  try {
    await client.update({
      index: INDEX_NAME,
      id: emailId,
      doc: { status, sentAt, messageId },
    });
  } catch (err) {
    console.error("[Elasticsearch] Update email status failed (non-fatal):", err instanceof Error ? err.message : err);
  }
}

export async function searchEmails(query: string) {
  try {
    const result = await client.search({
      index: INDEX_NAME,
      query: {
        multi_match: {
          query,
          fields: ["recipient", "subject", "body"],
        },
      },
    });

    return result.hits.hits.map((hit) => {
      const src = hit._source as Record<string, unknown>;
      return {
        id: hit._id,
        ...src,
      };
    });
  } catch (err) {
    console.error("[Elasticsearch] Search failed:", err instanceof Error ? err.message : err);
    throw err;
  }
}
