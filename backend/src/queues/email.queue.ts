import { Queue } from "bullmq";
import { Redis } from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export async function createEmailQueue(): Promise<Queue> {
  const connection = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  await new Promise<void>((resolve, reject) => {
    const onReady = () => { connection.removeListener("error", onError); resolve(); };
    const onError = (err: Error) => { connection.removeListener("ready", onReady); reject(err); };
    connection.once("ready", onReady);
    connection.once("error", onError);
  });

  return new Queue("email-send", {
    connection,
    defaultJobOptions: {
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    },
  });
}
