import React from "react";
import { getUsers } from "@/actions/users";
import CaseClient from "./CaseClient";

async function CasesPage() {
  const clients = await getUsers({ role: "CLIENT" });
  const lawyers = await getUsers({ role: "LAWYER" });

  return (
    <div className="max-w-7xl mx-auto p-8 rounded-xl shadow-lg bg-gray-50 border border-gray-200 mt-10">
      <CaseClient clients={clients} lawyers={lawyers} />
    </div>
  );
}

export default CasesPage;
