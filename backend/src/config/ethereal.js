"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransporter = getTransporter;
const nodemailer_1 = __importDefault(require("nodemailer"));
let transporter;
async function createTransporter() {
    if (process.env.ETHEREAL_USER && process.env.ETHEREAL_PASSWORD) {
        return nodemailer_1.default.createTransport({
            host: process.env.ETHEREAL_HOST || "smtp.ethereal.email",
            port: Number(process.env.ETHEREAL_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.ETHEREAL_USER,
                pass: process.env.ETHEREAL_PASSWORD,
            },
        });
    }
    console.log("[Ethereal] No credentials found, creating test account...");
    const testAccount = await nodemailer_1.default.createTestAccount();
    console.log("[Ethereal] Test account created:", testAccount.user);
    return nodemailer_1.default.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });
}
async function getTransporter() {
    if (!transporter) {
        transporter = await createTransporter();
    }
    return transporter;
}
//# sourceMappingURL=ethereal.js.map