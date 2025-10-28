import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";
import { sendEmail } from "./email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email",
        text: `Click the link to verify your email ${url}`,
      });
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
        input: false,
      },
      lastName: {
        type: "string",
        input: false,
      },
      middleName: {
        type: "string",
        input: false,
      },
      gender: {
        type: "string", // This might need to be handled specially for enums
        input: false,
      },
      birthday: {
        type: "date",
        input: false,
      },
      phone: {
        type: "string",
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your password",
        text: `Click the link to reset your password: ${url}`,
      });
    },
    onPasswordReset: async ({ user }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset password successful",
        text: "Your password has been reset",
      });
    },
  },
});
