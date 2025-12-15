import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { auth } from "./auth";
import { nextCookies } from "better-auth/next-js";

// Get base URL for client - must match server-side baseURL
function getClientBaseURL(): string {
  // In browser, use window.location.origin (current page URL)
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  
  // On server, use NEXT_PUBLIC_BASE_URL or fallback
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

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
  baseURL: getClientBaseURL(),
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
