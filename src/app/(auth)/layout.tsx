import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession();
  const user = session?.user;

  // Only redirect to dashboard if user is verified
  // Unverified users should stay on email-verified page
  if (user?.emailVerified) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
