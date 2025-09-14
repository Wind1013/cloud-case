import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const { signIn, signUp, signOut, useSession, getSession } =
  createAuthClient({
    plugins: [
      inferAdditionalFields({
        user: {
          role: {
            type: "string",
            required: false,
          },
        },
      }),
    ],
  });
