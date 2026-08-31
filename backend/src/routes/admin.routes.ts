import { Router } from "express";
import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { createEmailQueue } from "../queues/email.queue";

const router = Router();
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

let boardReady = false;

router.use("/admin/queues", async (req, res, next) => {
  if (!boardReady) {
    const emailQueue = await createEmailQueue();
    createBullBoard({
      queues: [new BullMQAdapter(emailQueue)],
      serverAdapter,
    });
    boardReady = true;
  }
  serverAdapter.getRouter()(req, res, next);
});

export default router;
