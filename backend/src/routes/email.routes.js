"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const email_controller_1 = require("../controllers/email.controller");
const search_service_1 = require("../services/search.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post("/api/emails/schedule", auth_middleware_1.authenticate, email_controller_1.scheduleEmailsController);
router.get("/api/emails/scheduled", auth_middleware_1.authenticate, email_controller_1.getScheduledEmails);
router.get("/api/emails/sent", auth_middleware_1.authenticate, email_controller_1.getSentEmails);
router.get("/api/emails/search", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const q = req.query.q;
        if (!q || q.trim().length === 0) {
            res.status(400).json({ success: false, message: "Query parameter 'q' is required" });
            return;
        }
        const emails = await (0, search_service_1.searchEmails)(q, req.user.userId);
        res.json({ success: true, query: q, emails });
    }
    catch (error) {
        console.error("[SearchController] Search error:", error);
        res.status(503).json({
            success: false,
            message: "Search service temporarily unavailable",
        });
    }
});
router.get("/api/emails/:id", auth_middleware_1.authenticate, email_controller_1.getEmailById);
exports.default = router;
//# sourceMappingURL=email.routes.js.map