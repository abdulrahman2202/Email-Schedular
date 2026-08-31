import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  lazyConnect: true,
});

redis.on("error", (err) => {
  console.error("[Redis] Connection error:", err.message);
});

redis.on("connect", () => {
  console.log("[Redis] Connected");
});

async function ensureRedisConnection(): Promise<void> {
  if (redis.status === "ready") return;
  await redis.connect();
}

export { redis, ensureRedisConnection };
