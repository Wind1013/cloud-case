"use client";

import { createCase } from "@/actions/cases";
import { User } from "@/generated/prisma";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import CaseFilingForm, { CaseFormValues } from "../CaseFilingForm";
import { useUploadFiles } from "better-upload/client";

export default function CaseClient({ clients }: { clients: User[] }) {
  const router = useRouter();
  
  // File upload configuration for pending files
  const { control } = useUploadFiles({
    route: "demo",
    onError: ({ message }) => {
      toast.error(`Failed to upload file: ${message}`);
    },
    onUploadComplete: () => {
      // Individual file upload complete
    },
  });

  async function onSubmit(values: CaseFormValues, pendingFiles?: File[]) {
    try {
      const result = await createCase(values);
      if (result.success && result.data) {
        toast.success("Case filed successfully");
        
        // Upload pending files if any
        if (pendingFiles && pendingFiles.length > 0) {
          try {
            // Upload files with the new caseId
            const uploadPromises = pendingFiles.map(file => 
              control.upload([file], { 
                metadata: { caseId: result.data.id } 
              })
            );
            
            await Promise.all(uploadPromises);
            toast.success("All files uploaded successfully");
          } catch (uploadError) {
            console.error("Error uploading files:", uploadError);
            toast.error("Case created but some files failed to upload. You can upload them from the edit page.");
          }
        }
        
        // Redirect to case management page
        router.push("/cases");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  }

  return <CaseFilingForm clients={clients} onSubmit={onSubmit} />;
}
