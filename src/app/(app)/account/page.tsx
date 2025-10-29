import { getUser } from "@/data/user";
import { AccountClient } from "./client";
import { redirect } from "next/navigation";

export default async function AccountPage() {
  const { data: user } = await getUser();

  if (!user) {
    redirect("/login");
  }

  return <AccountClient user={user} />;
}
