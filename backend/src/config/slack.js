"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slackConfig = void 0;
exports.slackConfig = {
    clientId: process.env.SLACK_CLIENT_ID || "",
    clientSecret: process.env.SLACK_CLIENT_SECRET || "",
    redirectUri: process.env.SLACK_REDIRECT_URI || "http://localhost:5000/api/slack/callback",
};
//# sourceMappingURL=slack.js.map