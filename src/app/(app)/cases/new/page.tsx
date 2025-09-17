import React from "react";
import CaseClient from "./CaseClient";
import { getUsers } from "@/data/users";

async function CasesPage() {
  const clients = await getUsers({ role: "CLIENT" });

  return (
    <div className="max-h-screen overflow-y-auto max-w-7xl mx-auto p-8 rounded-xl shadow-lg bg-gray-50 border border-gray-200 mt-10">
      <CaseClient clients={clients} />
    </div>
  );
}

export default CasesPage;
