import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import EmailVerifiedClient from "./client";

export default async function EmailVerifiedPage() {
  const session = await getServerSession();
  
  // If no session, redirect to sign-in
  if (!session?.user) {
    redirect("/sign-in");
  }
  
  // If user is already verified, redirect to dashboard
  if (session.user.emailVerified) {
    redirect("/dashboard");
  }

  return <EmailVerifiedClient email={session.user.email || ""} />;
}

