"use client";

import React from "react";
import CaseFilingForm, { CaseFormValues } from "../../CaseFilingForm";

import { Case, User } from "@/generated/prisma";
import { updateCase } from "@/actions/cases";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function EditClient({
  clients,
  caseData,
}: {
  clients: User[];
  caseData: Case;
}) {
  const router = useRouter();
  const { description, title, clientId, id } = caseData;

  const onSubmit = async (data: CaseFormValues) => {
    try {
      const result = await updateCase(id, data);
      if (result.success) {
        toast.success("Case updated successfully");
        router.push("/cases");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 rounded-xl shadow-lg bg-gray-50 border border-gray-200 mt-10">
      <CaseFilingForm
        clients={clients}
        onSubmit={onSubmit}
        initialData={{
          clientId,
          description: description || "",
          title,
        }}
      />
    </div>
  );
}

export default EditClient;
