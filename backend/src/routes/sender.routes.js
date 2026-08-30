"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../config/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const createSenderSchema = zod_1.z.object({
    email: zod_1.z.email("Invalid email address"),
    smtpUser: zod_1.z.string().trim().min(1, "smtpUser is required"),
    smtpPassword: zod_1.z.string().trim().min(1, "smtpPassword is required"),
});
router.get("/api/senders", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const senders = await prisma_1.prisma.sender.findMany({
            where: { userId },
            select: {
                id: true,
                email: true,
                smtpUser: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ success: true, senders });
    }
    catch (error) {
        console.error("[SenderController] List error:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error",
        });
    }
});
router.post("/api/senders", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const parsed = createSenderSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: parsed.error.issues,
            });
            return;
        }
        const userId = req.user.userId;
        const sender = await prisma_1.prisma.sender.create({
            data: {
                userId,
                email: parsed.data.email,
                smtpUser: parsed.data.smtpUser,
                smtpPassword: parsed.data.smtpPassword,
            },
            select: {
                id: true,
                email: true,
                smtpUser: true,
                createdAt: true,
            },
        });
        res.status(201).json({ success: true, sender });
    }
    catch (error) {
        console.error("[SenderController] Create error:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error",
        });
    }
});
exports.default = router;
//# sourceMappingURL=sender.routes.js.map