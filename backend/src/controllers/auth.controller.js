"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleAuth = googleAuth;
exports.googleCallback = googleCallback;
exports.getMe = getMe;
exports.logout = logout;
const auth_service_1 = require("../services/auth.service");
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
async function googleAuth(_req, res) {
    try {
        const url = (0, auth_service_1.getGoogleAuthUrl)();
        res.redirect(url);
    }
    catch (error) {
        console.error("Google auth redirect error:", error);
        res.status(500).json({ error: "Failed to initiate Google authentication" });
    }
}
async function googleCallback(req, res) {
    try {
        const code = req.query.code;
        if (!code) {
            res.status(400).json({ error: "Authorization code missing" });
            return;
        }
        const tokens = await (0, auth_service_1.exchangeCodeForTokens)(code);
        const googleUser = await (0, auth_service_1.getGoogleUserInfo)(tokens.access_token);
        const user = await (0, auth_service_1.findOrCreateUser)(googleUser);
        const token = (0, auth_service_1.createJwtToken)(user);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.redirect(`${FRONTEND_URL}/dashboard`);
    }
    catch (error) {
        console.error("Google callback error:", error);
        res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    }
}
async function getMe(req, res) {
    try {
        const { prisma } = await Promise.resolve().then(() => __importStar(require("../config/prisma")));
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
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
    }
    catch (error) {
        console.error("Get me error:", error);
        res.status(500).json({ error: "Failed to fetch user" });
    }
}
async function logout(_req, res) {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    res.json({ success: true, message: "Logged out successfully" });
}
//# sourceMappingURL=auth.controller.js.map