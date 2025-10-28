"use server";

import { getAuthSession } from "@/data/auth";
import { sendEmail } from "@/lib/email";
export async function sendSignInEmail({ email }: { email: string }) {
  await getAuthSession();

  await sendEmail({
    to: email,
    subject: "Successful Sign In",
    text: "You have successfully signed in to your account.",
  });
}
