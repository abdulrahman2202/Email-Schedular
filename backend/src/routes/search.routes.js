"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const search_service_1 = require("../services/search.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/api/emails/search", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const q = req.query.q;
        if (!q || q.trim().length === 0) {
            res.status(400).json({ success: false, message: "Query parameter 'q' is required" });
            return;
        }
        const emails = await (0, search_service_1.searchEmails)(q);
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
exports.default = router;
//# sourceMappingURL=search.routes.js.map