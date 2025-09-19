import React from "react";
import EditClient from "./EditClient";
import { notFound } from "next/navigation";
import { getUsers } from "@/data/users";
import { getCaseById } from "@/data/cases";

async function EditPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const clients = await getUsers({ role: "CLIENT" });
  const { data } = await getCaseById(id);

  if (!data) {
    notFound();
  }

  return <EditClient clients={clients} caseData={data} />;
}

export default EditPage;
