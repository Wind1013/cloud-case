import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
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
  },
});
