"use client";

import { createCase } from "@/actions/cases";
import { User } from "@/generated/prisma";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CaseFilingForm, { CaseFormValues } from "../CaseFilingForm";

export default function CaseClient({
  clients,
  lawyers,
}: {
  clients: User[];
  lawyers: User[];
}) {
  const router = useRouter();

  async function onSubmit(values: CaseFormValues) {
    try {
      const result = await createCase(values);
      if (result.success) {
        toast.success("Case filed successfully");
        router.push("/cases");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return (
    <CaseFilingForm clients={clients} lawyers={lawyers} onSubmit={onSubmit} />
  );
}
