import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { auth } from "./auth";
import { nextCookies } from "better-auth/next-js";

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
  requestPasswordReset,
  resetPassword,
  changePassword,
  changeEmail,
  sendVerificationEmail,
} = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>({
      user: {
        role: {
          type: "string",
          required: false,
        },
      },
    }),
    nextCookies(),
  ],
});
