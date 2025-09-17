import React from "react";
import CaseClient from "./CaseClient";
import { getUsers } from "@/data/users";

async function CasesPage() {
  const clients = await getUsers({ role: "CLIENT" });

  return (
    <div className="overflow-y-auto max-w-7xl mx-auto">
      <CaseClient clients={clients} />
    </div>
  );
}

export default CasesPage;
