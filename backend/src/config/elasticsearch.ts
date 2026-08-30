import { Client } from "@elastic/elasticsearch";

const apiKey = process.env.ELASTICSEARCH_API_KEY;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const client = new Client({
  node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
  ...(apiKey ? { auth: { apiKey } } : {}),
  headers: {
    accept: "application/json",
    "content-type": "application/json",
  },
  metaHeader: false,
} as any);

export { client };
