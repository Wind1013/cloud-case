import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession();
  const user = session?.user;

  if (user) redirect("/dashboard");

  return <>{children}</>;
}
