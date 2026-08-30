"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoogleAuthUrl = getGoogleAuthUrl;
exports.exchangeCodeForTokens = exchangeCodeForTokens;
exports.getGoogleUserInfo = getGoogleUserInfo;
exports.findOrCreateUser = findOrCreateUser;
exports.createJwtToken = createJwtToken;
const prisma_1 = require("../config/prisma");
const auth_middleware_1 = require("../middleware/auth.middleware");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback";
function getGoogleAuthUrl() {
    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "consent",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
async function exchangeCodeForTokens(code) {
    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: GOOGLE_REDIRECT_URI,
            grant_type: "authorization_code",
        }),
    });
    if (!response.ok) {
        const err = await response.text();
        throw new Error(`Google token exchange failed: ${err}`);
    }
    return response.json();
}
async function getGoogleUserInfo(accessToken) {
    const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch Google user info");
    }
    return response.json();
}
async function findOrCreateUser(googleUser) {
    let user = await prisma_1.prisma.user.findUnique({
        where: { googleId: googleUser.id },
    });
    if (!user) {
        user = await prisma_1.prisma.user.create({
            data: {
                googleId: googleUser.id,
                email: googleUser.email,
                name: googleUser.name,
                avatar: googleUser.picture,
            },
        });
    }
    else {
        user = await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                name: googleUser.name,
                avatar: googleUser.picture,
                email: googleUser.email,
            },
        });
    }
    return user;
}
function createJwtToken(user) {
    return (0, auth_middleware_1.signToken)({ userId: user.id, email: user.email });
}
//# sourceMappingURL=auth.service.js.map