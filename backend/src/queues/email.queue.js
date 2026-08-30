"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
const emailQueue = new bullmq_1.Queue("email-send", {
    connection: redis_1.redis,
    defaultJobOptions: {
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
    },
});
exports.emailQueue = emailQueue;
//# sourceMappingURL=email.queue.js.map