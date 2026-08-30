import { Router } from "express";
import { prisma } from "../config/prisma";

const router = Router();

router.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      message: error instanceof Error ? error.message : "Unknown database error",
    });
  }
});

export default router;
