"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const health_routes_1 = __importDefault(require("./routes/health.routes"));
const email_routes_1 = __importDefault(require("./routes/email.routes"));
const sender_routes_1 = __importDefault(require("./routes/sender.routes"));
const slack_routes_1 = __importDefault(require("./routes/slack.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const prisma_1 = require("./config/prisma");
const redis_1 = require("./config/redis");
const search_service_1 = require("./services/search.service");
require("./workers/email.worker");
dotenv_1.default.config();
const app = (0, express_1.default)();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
app.use((0, cors_1.default)({
    origin: FRONTEND_URL,
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use("/api/auth", auth_routes_1.default);
app.use(health_routes_1.default);
app.use(email_routes_1.default);
app.use(sender_routes_1.default);
app.use(slack_routes_1.default);
app.use(search_routes_1.default);
app.use(admin_routes_1.default);
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await (0, search_service_1.ensureIndex)();
});
const shutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
        await prisma_1.prisma.$disconnect();
        redis_1.redis.disconnect();
        console.log("Prisma disconnected. Redis disconnected. Server stopped.");
        process.exit(0);
    });
};
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
//# sourceMappingURL=server.js.map