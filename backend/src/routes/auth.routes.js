"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/google", auth_controller_1.googleAuth);
router.get("/google/callback", auth_controller_1.googleCallback);
router.get("/me", auth_middleware_1.authenticate, auth_controller_1.getMe);
router.post("/logout", auth_controller_1.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map