import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import healthRoutes from "./routes/health.routes";
import emailRoutes from "./routes/email.routes";
import senderRoutes from "./routes/sender.routes";
import slackRoutes from "./routes/slack.routes";
import adminRoutes from "./routes/admin.routes";
import authRoutes from "./routes/auth.routes";

dotenv.config();

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use(healthRoutes);
app.use(emailRoutes);
app.use(senderRoutes);
app.use(slackRoutes);
app.use(adminRoutes);

export { app };
