import { getUser } from "@/data/user";
import { redirect } from "next/navigation";
import { ChangePasswordClient } from "./client";

export default async function ChangePasswordPage() {
  const { data: user } = await getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return <ChangePasswordClient />;
}
