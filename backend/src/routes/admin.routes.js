"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_2 = require("@bull-board/express");
const api_1 = require("@bull-board/api");
const bullMQAdapter_1 = require("@bull-board/api/bullMQAdapter");
const email_queue_1 = require("../queues/email.queue");
const router = (0, express_1.Router)();
const serverAdapter = new express_2.ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");
(0, api_1.createBullBoard)({
    queues: [new bullMQAdapter_1.BullMQAdapter(email_queue_1.emailQueue)],
    serverAdapter,
});
router.use("/admin/queues", serverAdapter.getRouter());
exports.default = router;
//# sourceMappingURL=admin.routes.js.map