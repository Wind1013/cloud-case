import "server-only";
import { config } from "@/config";
import nodemailer from "nodemailer";

export type SendEmailValues = {
  from?: string;
  to: string;
  subject: string;
  text: string;
  html?: string;
};

// Validate Gmail SMTP configuration
if (!config.SMTP_USER || !config.SMTP_PASSWORD) {
  throw new Error("SMTP_USER and SMTP_PASSWORD are required. Please configure Gmail SMTP in your .env file.");
}

// Initialize Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(config.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASSWORD.replace(/\s/g, ''), // Remove spaces from app password
  },
  tls: {
    // For development: bypass certificate validation
    // In production, you should properly configure SSL certificates
    rejectUnauthorized: process.env.NODE_ENV === "production" ? true : false,
  },
});

console.log("✅ [SERVER] Gmail SMTP transporter initialized");
console.log("   SMTP Host:", config.SMTP_HOST || "smtp.gmail.com");
console.log("   SMTP Port:", config.SMTP_PORT || "587");
console.log("   SMTP User:", config.SMTP_USER);
console.log("   SMTP From:", config.SMTP_FROM || config.SMTP_USER);

export async function sendEmail({
  from,
  to,
  subject,
  text,
  html,
}: SendEmailValues) {
  try {
    const fromEmail = from || config.SMTP_FROM || config.SMTP_USER || "noreply@gmail.com";
    
    console.log("📧 [SERVER] Sending email via Gmail SMTP:");
    console.log("   From:", fromEmail);
    console.log("   To:", to);
    console.log("   Subject:", subject);
    
    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject,
      text,
      html: html || text,
    });
    
    console.log("✅ [SERVER] Email sent successfully via Gmail SMTP!");
    console.log("   Message ID:", info.messageId);
    console.log("   Response:", info.response);
    
    return {
      data: {
        id: info.messageId || `smtp-${Date.now()}`,
      },
      error: null,
    };
  } catch (error: any) {
    console.error("❌ [SERVER] Email sending failed:");
    console.error("   Error Type:", error?.constructor?.name);
    console.error("   Error:", error);
    if (error?.message) {
      console.error("   Message:", error.message);
    }
    if (error?.code) {
      console.error("   Error Code:", error.code);
    }
    if (error?.response) {
      console.error("   Response:", error.response);
    }
    throw error;
  }
}
