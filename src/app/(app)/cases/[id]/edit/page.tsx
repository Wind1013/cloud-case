import { getCaseById } from "@/actions/cases";
import { getUsers } from "@/actions/users";
import React from "react";
import EditClient from "./EditClient";
import { notFound } from "next/navigation";

async function EditPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const clients = await getUsers({ role: "CLIENT" });
  const lawyers = await getUsers({ role: "LAWYER" });
  const { data } = await getCaseById(id);

  if (!data) {
    notFound();
  }

  return <EditClient clients={clients} lawyers={lawyers} caseData={data} />;
}

export default EditPage;
