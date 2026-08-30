import { WebClient } from "@slack/web-api";
import { prisma } from "../config/prisma";
import { slackConfig } from "../config/slack";

export function getSlackAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: slackConfig.clientId,
    redirect_uri: slackConfig.redirectUri,
    scope: "chat:write",
  });
  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}

export async function exchangeSlackCode(code: string) {
  const client = new WebClient();
  const result = await client.oauth.v2.access({
    client_id: slackConfig.clientId,
    client_secret: slackConfig.clientSecret,
    code,
    redirect_uri: slackConfig.redirectUri,
  });

  if (!result.ok || !result.access_token || !result.team) {
    throw new Error(result.error || "Failed to exchange Slack code");
  }

  return {
    accessToken: result.access_token as string,
    teamId: result.team.id as string,
  };
}

export async function saveSlackConnection(userId: string, accessToken: string, teamId: string) {
  await prisma.slackConnection.upsert({
    where: { userId },
    create: { userId, accessToken, teamId },
    update: { accessToken, teamId },
  });
}

export async function getSlackStatus(userId: string) {
  const connection = await prisma.slackConnection.findUnique({
    where: { userId },
    select: { teamId: true, createdAt: true },
  });
  return { connected: !!connection, teamId: connection?.teamId ?? null };
}

export async function disconnectSlack(userId: string) {
  await prisma.slackConnection.deleteMany({ where: { userId } });
}

export async function sendSlackNotification(userId: string, message: string): Promise<void> {
  try {
    const connection = await prisma.slackConnection.findUnique({
      where: { userId },
    });
    if (!connection) return;

    const slack = new WebClient(connection.accessToken);
    const auth = await slack.auth.test();
    if (!auth.ok || !auth.user_id) return;

    await slack.chat.postMessage({
      channel: auth.user_id,
      text: message,
    });
  } catch (err) {
    console.error("[Slack] Notification failed (non-fatal):", err instanceof Error ? err.message : err);
  }
}
