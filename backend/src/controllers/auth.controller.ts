import { Request, Response } from "express";
import {
  getGoogleAuthUrl,
  exchangeCodeForTokens,
  getGoogleUserInfo,
  findOrCreateUser,
  createJwtToken,
} from "../services/auth.service";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export async function googleAuth(_req: Request, res: Response): Promise<void> {
  try {
    const url = getGoogleAuthUrl();
    res.redirect(url);
  } catch (error) {
    console.error("Google auth redirect error:", error);
    res.status(500).json({ error: "Failed to initiate Google authentication" });
  }
}

export async function googleCallback(req: Request, res: Response): Promise<void> {
  try {
    const code = req.query.code as string;

    if (!code) {
      res.status(400).json({ error: "Authorization code missing" });
      return;
    }

    const tokens = await exchangeCodeForTokens(code);
    const googleUser = await getGoogleUserInfo(tokens.access_token);
    const user = await findOrCreateUser(googleUser);
    const token = createJwtToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect(`${FRONTEND_URL}/dashboard`);
  } catch (error) {
    // Diagnostic: log Prisma error code/message only (no tokens, cookies, or secrets)
    if (error && typeof error === "object" && "code" in error) {
      const prismaErr = error as { code: string; message: string; meta?: unknown };
      console.error(
        `[AuthCallback] Prisma error — code: ${prismaErr.code}, message: ${prismaErr.message}, meta: ${JSON.stringify(prismaErr.meta ?? null)}`
      );
    } else {
      console.error("Google callback error:", error);
    }
    res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
  }
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const { prisma } = await import("../config/prisma");
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ success: true, message: "Logged out successfully" });
}
