"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSlackAuthUrl = getSlackAuthUrl;
exports.exchangeSlackCode = exchangeSlackCode;
exports.saveSlackConnection = saveSlackConnection;
exports.getSlackStatus = getSlackStatus;
exports.disconnectSlack = disconnectSlack;
exports.sendSlackNotification = sendSlackNotification;
const web_api_1 = require("@slack/web-api");
const prisma_1 = require("../config/prisma");
const slack_1 = require("../config/slack");
function getSlackAuthUrl() {
    const params = new URLSearchParams({
        client_id: slack_1.slackConfig.clientId,
        redirect_uri: slack_1.slackConfig.redirectUri,
        scope: "chat:write",
    });
    return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}
async function exchangeSlackCode(code) {
    const client = new web_api_1.WebClient();
    const result = await client.oauth.v2.access({
        client_id: slack_1.slackConfig.clientId,
        client_secret: slack_1.slackConfig.clientSecret,
        code,
        redirect_uri: slack_1.slackConfig.redirectUri,
    });
    if (!result.ok || !result.access_token || !result.team) {
        throw new Error(result.error || "Failed to exchange Slack code");
    }
    return {
        accessToken: result.access_token,
        teamId: result.team.id,
    };
}
async function saveSlackConnection(userId, accessToken, teamId) {
    await prisma_1.prisma.slackConnection.upsert({
        where: { userId },
        create: { userId, accessToken, teamId },
        update: { accessToken, teamId },
    });
}
async function getSlackStatus(userId) {
    const connection = await prisma_1.prisma.slackConnection.findUnique({
        where: { userId },
        select: { teamId: true, createdAt: true },
    });
    return { connected: !!connection, teamId: connection?.teamId ?? null };
}
async function disconnectSlack(userId) {
    await prisma_1.prisma.slackConnection.deleteMany({ where: { userId } });
}
async function sendSlackNotification(userId, message) {
    try {
        const connection = await prisma_1.prisma.slackConnection.findUnique({
            where: { userId },
        });
        if (!connection)
            return;
        const slack = new web_api_1.WebClient(connection.accessToken);
        const auth = await slack.auth.test();
        if (!auth.ok || !auth.user_id)
            return;
        await slack.chat.postMessage({
            channel: auth.user_id,
            text: message,
        });
    }
    catch (err) {
        console.error("[Slack] Notification failed (non-fatal):", err instanceof Error ? err.message : err);
    }
}
//# sourceMappingURL=slack.service.js.map