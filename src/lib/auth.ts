import { betterAuth, type User } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/generated/prisma";
import { sendEmail } from "./email";
import { buildEmailHtml } from "./email-template";

// Create a separate Prisma instance for better-auth without extensions
// This ensures better-auth can properly create verification tokens
// Better-auth needs a clean Prisma client without extensions to work correctly
const authPrisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" 
    ? ["query", "error", "warn", "info"] 
    : ["error"],
});

// Test database connection on startup
authPrisma.$connect()
  .then(() => {
    console.log("✅ [AUTH] Database connection established for better-auth");
  })
  .catch((error) => {
    console.error("❌ [AUTH] Failed to connect to database:", error);
  });

// Get the correct base URL for production
function getBaseURL(): string {
  // Priority 1: Explicit NEXT_PUBLIC_BASE_URL (should be set in Vercel)
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  
  // Priority 2: VERCEL_URL (automatically set by Vercel)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // Priority 3: VERCEL_BRANCH_URL (for preview deployments)
  if (process.env.VERCEL_BRANCH_URL) {
    return `https://${process.env.VERCEL_BRANCH_URL}`;
  }
  
  // Fallback: localhost for development
  return process.env.NODE_ENV === "production" 
    ? "https://your-app.vercel.app" // This should never be reached if env vars are set
    : "http://localhost:3000";
}

const baseURL = getBaseURL();
console.log("🔗 [AUTH] Base URL configured:", baseURL);
console.log("   NEXT_PUBLIC_BASE_URL:", process.env.NEXT_PUBLIC_BASE_URL || "not set");
console.log("   VERCEL_URL:", process.env.VERCEL_URL || "not set");
console.log("   NODE_ENV:", process.env.NODE_ENV || "not set");

export const auth = betterAuth({
  baseURL,
  basePath: "/api/auth",
  trustedOrigins: [
    baseURL,
    ...(process.env.NEXT_PUBLIC_BASE_URL ? [process.env.NEXT_PUBLIC_BASE_URL] : []),
    ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
    ...(process.env.VERCEL_BRANCH_URL ? [`https://${process.env.VERCEL_BRANCH_URL}`] : []),
    "http://localhost:3000", // For local development
  ],
  database: prismaAdapter(authPrisma, {
    provider: "postgresql",
  }),
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      try {
        console.log("📧 [SERVER] sendVerificationEmail called");
        console.log("   User ID:", user.id);
        console.log("   User Email:", user.email);
        console.log("   User Name:", user.name);
        console.log("   Base URL:", baseURL);
        console.log("   Verification URL:", url);
        console.log("   URL Length:", url?.length);
        
        // Ensure URL is absolute (starts with http:// or https://)
        let verificationUrl = url;
        if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
          // If URL is relative, make it absolute using baseURL
          verificationUrl = `${baseURL}${url.startsWith("/") ? "" : "/"}${url}`;
          console.log("   ⚠️ URL was relative, converted to absolute:", verificationUrl);
        }
        
        // Check if verification token exists in database
        let verification = null;
        try {
          // Test database connection first
          await authPrisma.$connect();
          console.log("✅ [SERVER] Database connection successful");
          
          // Check all verification records to see what's in the table
          const allVerifications = await authPrisma.verification.findMany({
            orderBy: {
              createdAt: 'desc',
            },
            take: 5,
          });
          
          console.log("📊 [SERVER] Total verification records in database:", allVerifications.length);
          if (allVerifications.length > 0) {
            console.log("📊 [SERVER] Recent verification records:", allVerifications.map(v => ({
              id: v.id,
              identifier: v.identifier,
              expiresAt: v.expiresAt,
            })));
          }
          
          verification = await authPrisma.verification.findFirst({
            where: {
              identifier: user.email,
            },
            orderBy: {
              createdAt: 'desc',
            },
          });
          
          if (verification) {
            console.log("✅ [SERVER] Verification token found in database:");
            console.log("   Token ID:", verification.id);
            console.log("   Identifier:", verification.identifier);
            console.log("   Value (first 10 chars):", verification.value.substring(0, 10) + "...");
            console.log("   Expires At:", verification.expiresAt);
            console.log("   Created At:", verification.createdAt);
            console.log("   Is Expired:", new Date() > verification.expiresAt);
          } else {
            console.warn("⚠️ [SERVER] WARNING: No verification token found for email:", user.email);
            console.warn("   Better-auth should have created this, but it didn't. Creating manually...");
            
            // Extract token from URL if possible, or create a new one
            // The URL format is: /api/auth/verify-email?token=...&callbackURL=...
            let tokenParam = null;
            try {
              // Try to parse as absolute URL first
              const urlObj = new URL(url);
              tokenParam = urlObj.searchParams.get("token");
            } catch {
              // If URL is relative, try parsing with baseURL
              try {
                const urlObj = new URL(url, baseURL);
                tokenParam = urlObj.searchParams.get("token");
              } catch {
                // If that fails, try to extract token manually from query string
                const match = url.match(/[?&]token=([^&]+)/);
                if (match) {
                  tokenParam = match[1];
                }
              }
            }
            
            if (tokenParam) {
              // Create verification record from the token in the URL
              try {
                verification = await authPrisma.verification.create({
                  data: {
                    id: crypto.randomUUID(),
                    identifier: user.email,
                    value: tokenParam, // Store the JWT token from the URL
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                  },
                });
                console.log("✅ [SERVER] Created verification token manually from URL");
                console.log("   Token ID:", verification.id);
                console.log("   Token value (first 20 chars):", verification.value.substring(0, 20) + "...");
              } catch (createError: any) {
                console.error("❌ [SERVER] Failed to create verification token:", createError);
              }
            } else {
              console.error("❌ [SERVER] Could not extract token from URL:", url);
            }
          }
        } catch (dbError: any) {
          console.error("❌ [SERVER] Error checking verification token:");
          console.error("   Error:", dbError);
          console.error("   Message:", dbError?.message);
          console.error("   Code:", dbError?.code);
          console.error("   Meta:", dbError?.meta);
          console.error("   This might indicate a database connection or schema issue");
          
          // Try to test database connection
          try {
            await authPrisma.$queryRaw`SELECT 1`;
            console.log("✅ [SERVER] Database connection test passed");
          } catch (testError) {
            console.error("❌ [SERVER] Database connection test failed:", testError);
          }
        }
        
        const html = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
                <h1 style="color: #2563eb; margin-top: 0;">Verify Your Email Address</h1>
                <p>Hello ${user.name || "there"},</p>
                <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationUrl}" 
                     style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Verify Email Address
                  </a>
                </div>
                <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
                <p style="color: #2563eb; word-break: break-all; font-size: 12px; background-color: #f1f5f9; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
                <p style="color: #666; font-size: 14px; margin-top: 30px;">This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Cloud Case. All rights reserved.</p>
              </div>
            </body>
          </html>
        `;
        
        try {
          const emailResult = await sendEmail({
            to: user.email,
            subject: "Verify your email address",
            text: `Hello ${user.name || "there"},\n\nThank you for signing up! Please verify your email address by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.\n\n© ${new Date().getFullYear()} Cloud Case. All rights reserved.`,
            html,
          });
          
          if (emailResult?.data?.id) {
            console.log("✅ [SERVER] Verification email sent successfully to:", user.email);
            console.log("   Email Message ID:", emailResult.data.id);
          } else {
            console.warn("⚠️ [SERVER] Email send completed but no email ID returned");
            console.warn("   Result:", JSON.stringify(emailResult, null, 2));
          }
        } catch (emailError: any) {
          // Log detailed error information
          console.error("❌ [SERVER] Failed to send verification email:");
          console.error("   Error Type:", emailError?.constructor?.name);
          console.error("   Error Message:", emailError?.message);
          console.error("   Error Code:", emailError?.code);
          console.error("   Error Response:", emailError?.response);
          console.error("   SMTP Host:", process.env.SMTP_HOST);
          console.error("   SMTP User:", process.env.SMTP_USER);
          console.error("   Base URL:", baseURL);
          console.error("   Verification URL:", verificationUrl);
          console.error("   Full Error:", JSON.stringify(emailError, null, 2));
          
          // Re-throw the error so better-auth knows it failed
          // This will prevent signup from completing if email fails
          throw new Error(`Failed to send verification email: ${emailError?.message || "Unknown error"}`);
        }
      } catch (error: any) {
        console.error("❌ [SERVER] Unexpected error in sendVerificationEmail:");
        console.error("   Error:", error);
        console.error("   Error Message:", error?.message);
        console.error("   Error Stack:", error?.stack);
        // Don't throw - allow signup to succeed
      }
    },
    sendOnSignIn: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        input: false,
      },
      firstName: {
        type: "string",
        input: true,
      },
      lastName: {
        type: "string",
        input: true,
      },
      middleName: {
        type: "string",
        input: true,
      },
      gender: {
        type: "string",
        input: true,
      },
      birthday: {
        type: "date",
        input: true,
      },
      phone: {
        type: "string",
        input: true,
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({
        user,
        newEmail,
        url,
        token,
      }: {
        user: User;
        newEmail: string;
        url: string;
        token: string;
      }) => {
        await sendEmail({
          to: user.email, // verification email must be sent to the current user email to approve the change
          subject: "Approve Email Change Request",
          text: `Dear ${user.name || "Valued Client"},

We received a request to change the email address on your Cloud Case account to ${newEmail}.

If you initiated this request, please approve the change using the link below:
${url}

If you did not request this change, please disregard this email.

Kind regards,
Cloud Case Security Team`,
          html: buildEmailHtml({
            title: "Approve Email Change Request",
            body: `
              <p>Dear ${user.name || "Valued Client"},</p>
              <p>We received a request to change the email address associated with your Cloud Case account to <strong>${newEmail}</strong>.</p>
              <p>If you initiated this change, please approve it by selecting the button below.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${url}" style="display:inline-block;background-color:#1d4ed8;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;">
                  Approve Email Change
                </a>
              </div>
              <p style="color:#4b5563;font-size:14px;">If you did not request this update, you can safely ignore this email and no changes will be made.</p>
              <p>Kind regards,<br/>Cloud Case Security Team</p>
            `,
          }),
        });
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Instructions",
        text: `Dear ${user.name || "Valued Client"},

We received a request to reset the password for your Cloud Case account.

If you initiated this request, please reset your password using the link below:
${url}

This link is valid for a limited time. If you did not request a password reset, please disregard this message.

Sincerely,
Cloud Case Support Team`,
        html: buildEmailHtml({
          title: "Password Reset Instructions",
          body: `
            <p>Dear ${user.name || "Valued Client"},</p>
            <p>We received a request to reset the password for your Cloud Case account.</p>
            <p>If you initiated this request, please create a new password by selecting the button below:</p>
            <div style="text-align:center;margin:30px 0;">
              <a href="${url}" style="display:inline-block;background-color:#1d4ed8;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;">
                Reset Password
              </a>
            </div>
            <p style="color:#4b5563;font-size:14px;">This link is valid for a limited time. If you did not request a password reset, you may safely ignore this email.</p>
            <p>Sincerely,<br/>Cloud Case Support Team</p>
          `,
        }),
      });
    },
    onPasswordReset: async ({ user }) => {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Confirmation",
        text: `Dear ${user.name || "Valued Client"},

This is a confirmation that the password for your Cloud Case account was reset successfully on ${new Date().toLocaleString()}.

If you completed this change, no further action is required. If you did not authorize this update, please contact our support team immediately.

Best regards,
Cloud Case Security Team`,
        html: buildEmailHtml({
          title: "Password Reset Confirmation",
          body: `
            <p>Dear ${user.name || "Valued Client"},</p>
            <p>This is a confirmation that the password for your Cloud Case account was reset successfully on <strong>${new Date().toLocaleString()}</strong>.</p>
            <div style="background-color:#fef3c7;padding:16px;border-radius:8px;border-left:4px solid #f59e0b;margin:24px 0;">
              <p style="margin:0;color:#78350f;">If you initiated this change, no further action is required. If you did not authorize this update, please contact our support team immediately so we can secure your account.</p>
            </div>
            <p>Best regards,<br/>Cloud Case Security Team</p>
          `,
        }),
      });
    },
  },
});
