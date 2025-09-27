"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UploadDropzone } from "@/components/ui/upload-dropzone";
import { useUploadFiles } from "better-upload/client";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Document } from "@/generated/prisma";
import CaseFilesList from "./CaseFilesList";

const CaseFilesCard = ({
  caseId,
  documents,
}: {
  caseId: string;
  documents?: Document[];
}) => {
  const router = useRouter();
  const { control } = useUploadFiles({
    route: "demo",
    onError: ({ message }) => {
      toast.error(message);
    },
    onUploadComplete: () => {
      toast.success("Upload successful");
      router.refresh();
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Case Files
        </CardTitle>
        <CardDescription>
          Manage documents and images related to this case
        </CardDescription>
      </CardHeader>
      <CardContent>
        <UploadDropzone
          control={control}
          metadata={{ caseId }}
          accept="image/*,application/pdf,.pdf,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,application/vnd.ms-excel,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx,text/plain,.txt"
          description={{
            maxFileSize: "10MB",
            fileTypes: "JPEG, PNG, GIF, PDF, DOC, TXT",
          }}
        />
        <CaseFilesList documents={documents} />
      </CardContent>
    </Card>
  );
};

export default CaseFilesCard;
