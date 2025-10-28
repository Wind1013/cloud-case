import { redirect } from "next/navigation";
import React from "react";

const page = () => {
  redirect("/sign-in");
};

export default page;
