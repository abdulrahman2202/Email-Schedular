import { Queue } from "bullmq";
import { redis } from "../config/redis";

const emailQueue = new Queue("email-send", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

export { emailQueue };
