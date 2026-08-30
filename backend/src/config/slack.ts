export const slackConfig = {
  clientId: process.env.SLACK_CLIENT_ID || "",
  clientSecret: process.env.SLACK_CLIENT_SECRET || "",
  redirectUri: process.env.SLACK_REDIRECT_URI || "http://localhost:5000/api/slack/callback",
};
