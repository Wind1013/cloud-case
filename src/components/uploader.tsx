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
      accept="image/*, application/pdf"
      description={{
        maxFiles: 4,
        maxFileSize: "5MB",
        fileTypes: "JPEG, PNG, GIF, PDF",
      }}
    />
  );
}
