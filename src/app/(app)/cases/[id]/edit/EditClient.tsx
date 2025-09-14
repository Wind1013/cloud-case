"use client";

import React from "react";
import CaseFilingForm, { CaseFormValues } from "../../CaseFilingForm";

import { Case, User } from "@/generated/prisma";
import { updateCase } from "@/actions/cases";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function EditClient({
  clients,
  lawyers,
  caseData,
}: {
  clients: User[];
  lawyers: User[];
  caseData: Case;
}) {
  const router = useRouter();
  const { description, title, lawyerId, clientId, id } = caseData;

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
        lawyers={lawyers}
        onSubmit={onSubmit}
        initialData={{
          lawyerId,
          clientId,
          description: description || "",
          title,
        }}
      />
    </div>
  );
}

export default EditClient;
