"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../config/prisma");
const router = (0, express_1.Router)();
router.get("/api/health", async (_req, res) => {
    try {
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        res.status(200).json({
            status: "ok",
            database: "connected",
        });
    }
    catch (error) {
        res.status(500).json({
            status: "error",
            database: "disconnected",
            message: error instanceof Error ? error.message : "Unknown database error",
        });
    }
});
exports.default = router;
//# sourceMappingURL=health.routes.js.map