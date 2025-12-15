"use client";

import React from "react";
import CaseFilingForm, { CaseFormValues } from "../../CaseFilingForm";

import { Case, User, Document } from "@/generated/prisma";
import { updateCase } from "@/actions/cases";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getCaseById } from "@/data/cases";

function EditClient({
  clients,
  caseData,
}: {
  clients: User[];
  caseData: Case & { documents?: Document[] };
}) {
  const router = useRouter();
  const { description, title, clientId, id, type, status } = caseData;

  const onSubmit = async (data: CaseFormValues, pendingFiles?: File[]) => {
    try {
      const result = await updateCase(id, data);
      if (result.success) {
        // Note: Files are already uploaded in CaseFilingForm's onPrepareSubmit
        // Wait a bit longer to ensure all files are fully saved before redirecting
        setTimeout(() => {
          router.push("/cases");
        }, 2000);
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <CaseFilingForm
        clients={clients}
        onSubmit={onSubmit}
        initialData={{
          clientId,
          description: description || "",
          title,
          type,
          status,
        }}
        caseId={id}
        documents={caseData.documents ?? []}
      />
    </div>
  );
}

export default EditClient;
