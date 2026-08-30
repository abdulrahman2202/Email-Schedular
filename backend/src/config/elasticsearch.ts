import { Client } from "@elastic/elasticsearch";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const client = new Client({
  node: process.env.ELASTICSEARCH_URL || "http://localhost:9200",
  headers: {
    accept: "application/json",
    "content-type": "application/json",
  },
  metaHeader: false,
} as any);

export { client };
