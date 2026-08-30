"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const slack_controller_1 = require("../controllers/slack.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/api/slack/connect", auth_middleware_1.authenticate, slack_controller_1.slackConnect);
router.get("/api/slack/callback", slack_controller_1.slackCallback);
router.get("/api/slack/status", auth_middleware_1.authenticate, slack_controller_1.slackStatus);
router.post("/api/slack/disconnect", auth_middleware_1.authenticate, slack_controller_1.slackDisconnect);
exports.default = router;
//# sourceMappingURL=slack.routes.js.map