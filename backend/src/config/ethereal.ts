import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter;

async function createTransporter(): Promise<nodemailer.Transporter> {
  if (process.env.ETHEREAL_USER && process.env.ETHEREAL_PASSWORD) {
    return nodemailer.createTransport({
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
  const testAccount = await nodemailer.createTestAccount();
  console.log("[Ethereal] Test account created:", testAccount.user);

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

export async function getTransporter(): Promise<nodemailer.Transporter> {
  if (!transporter) {
    transporter = await createTransporter();
  }
  return transporter;
}
