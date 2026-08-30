"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slackConnect = slackConnect;
exports.slackCallback = slackCallback;
exports.slackStatus = slackStatus;
exports.slackDisconnect = slackDisconnect;
const slack_service_1 = require("../services/slack.service");
function slackConnect(_req, res) {
    const url = (0, slack_service_1.getSlackAuthUrl)();
    res.redirect(url);
}
async function slackCallback(req, res) {
    try {
        const code = req.query.code;
        if (!code) {
            res.status(400).json({ success: false, message: "Missing code parameter" });
            return;
        }
        const { accessToken, teamId } = await (0, slack_service_1.exchangeSlackCode)(code);
        await (0, slack_service_1.saveSlackConnection)("slack-bot-user", accessToken, teamId);
        res.json({ success: true, message: "Slack connected successfully", teamId });
    }
    catch (error) {
        console.error("[SlackController] Callback error:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Slack connection failed",
        });
    }
}
async function slackStatus(req, res) {
    try {
        const userId = req.user.userId;
        const status = await (0, slack_service_1.getSlackStatus)(userId);
        res.json({ success: true, ...status });
    }
    catch (error) {
        console.error("[SlackController] Status error:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
async function slackDisconnect(req, res) {
    try {
        const userId = req.user.userId;
        await (0, slack_service_1.disconnectSlack)(userId);
        res.json({ success: true, message: "Slack disconnected" });
    }
    catch (error) {
        console.error("[SlackController] Disconnect error:", error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
//# sourceMappingURL=slack.controller.js.map