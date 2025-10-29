import { getServerSession } from "@/lib/get-session";
import React from "react";
import ChangeEmailClient from "./client";

const ChangeEmailPage = async () => {
  const session = await getServerSession();
  return <ChangeEmailClient isVerified={!!session?.user.emailVerified} />;
};

export default ChangeEmailPage;
