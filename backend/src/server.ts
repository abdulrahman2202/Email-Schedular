import { app } from "./app";
import adminRoutes from "./routes/admin.routes";
import { prisma } from "./config/prisma";
import { redis } from "./config/redis";
import { ensureIndex } from "./services/search.service";
import "./workers/email.worker";

app.use(adminRoutes);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);
  await ensureIndex();
});

const shutdown = async (signal: string) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    redis.disconnect();
    console.log("Prisma disconnected. Redis disconnected. Server stopped.");
    process.exit(0);
  });
};

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
