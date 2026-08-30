import { Request, Response } from "express";
import {
  getSlackAuthUrl,
  exchangeSlackCode,
  saveSlackConnection,
  getSlackStatus,
  disconnectSlack,
} from "../services/slack.service";

const DEV_USER_ID = "dev-user-id";

export function slackConnect(_req: Request, res: Response) {
  const url = getSlackAuthUrl();
  res.redirect(url);
}

export async function slackCallback(req: Request, res: Response) {
  try {
    const code = req.query.code as string | undefined;
    if (!code) {
      res.status(400).json({ success: false, message: "Missing code parameter" });
      return;
    }

    const { accessToken, teamId } = await exchangeSlackCode(code);
    await saveSlackConnection(DEV_USER_ID, accessToken, teamId);

    res.json({ success: true, message: "Slack connected successfully", teamId });
  } catch (error) {
    console.error("[SlackController] Callback error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Slack connection failed",
    });
  }
}

export async function slackStatus(_req: Request, res: Response) {
  try {
    const status = await getSlackStatus(DEV_USER_ID);
    res.json({ success: true, ...status });
  } catch (error) {
    console.error("[SlackController] Status error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

export async function slackDisconnect(_req: Request, res: Response) {
  try {
    await disconnectSlack(DEV_USER_ID);
    res.json({ success: true, message: "Slack disconnected" });
  } catch (error) {
    console.error("[SlackController] Disconnect error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
