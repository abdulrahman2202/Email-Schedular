"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const email_controller_1 = require("../controllers/email.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post("/api/emails/schedule", auth_middleware_1.authenticate, email_controller_1.scheduleEmailsController);
router.get("/api/emails/scheduled", auth_middleware_1.authenticate, email_controller_1.getScheduledEmails);
router.get("/api/emails/sent", auth_middleware_1.authenticate, email_controller_1.getSentEmails);
exports.default = router;
//# sourceMappingURL=email.routes.js.map