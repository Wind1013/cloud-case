"use client"; // For Next.js

import { useUploadFiles } from "better-upload/client";
import { UploadDropzoneProgress } from "./ui/upload-dropzone-progress";
import { toast } from "sonner";

export function Uploader() {
  const { control } = useUploadFiles({
    route: "demo",
    onError: () => {
      toast.error("Error uploading");
    },
  });

  return (
    <UploadDropzoneProgress
      control={control}
      accept="image/*,application/pdf,.pdf,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,application/vnd.ms-excel,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx,text/plain,.txt"
      description={{
        maxFiles: 4,
        maxFileSize: "5MB",
        fileTypes: "JPEG, PNG, GIF, PDF, DOC, TXT",
      }}
      metadata={{ caseId: "cmfwoq6aj000jh9e7ggk73f6w" }}
    />
  );
}
