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
import { toast } from "sonner";
import { Document } from "@/generated/prisma";
import { useState, useEffect } from "react";
import CaseFilesList from "./CaseFilesList";

const CaseFilesCard = ({
  caseId,
  documents: initialDocuments,
}: {
  caseId: string;
  documents?: Document[];
}) => {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments || []);
  const [isLoading, setIsLoading] = useState(false);
  
  // Update documents when initialDocuments change
  useEffect(() => {
    setDocuments(initialDocuments || []);
  }, [initialDocuments]);

  // Function to fetch updated documents
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/cases/${caseId}/documents`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      
      const result = await response.json();
      if (result.success && result.documents) {
        setDocuments(result.documents);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const { control } = useUploadFiles({
    route: "demo",
    onError: ({ message }) => {
      toast.error(message);
      setIsLoading(false);
    },
    onUploadComplete: async () => {
      // Wait a bit to ensure database operations complete
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setIsLoading(false);
      
      // Fetch updated documents automatically (includes both existing and new files)
      await fetchDocuments();
      
      toast.success("Files uploaded successfully");
    },
  });

  // Custom upload handler
  const handleUpload = (
    input: File[] | FileList,
    options?: { metadata?: Record<string, unknown> }
  ) => {
    // Convert FileList to Array if needed
    const files = input instanceof FileList ? Array.from(input) : input;
    
    setIsLoading(true);
    
    // Call the original upload function
    control.upload(files, options);
  };

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
          metadata={{ caseId: caseId }}
          uploadOverride={handleUpload}
          accept="image/*,application/pdf,.pdf,application/msword,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,application/vnd.ms-excel,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx,text/plain,.txt"
          description={{
            maxFileSize: "10MB",
            fileTypes: "JPEG, PNG, GIF, PDF, DOC, TXT",
          }}
        />
        <CaseFilesList documents={documents} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
};

export default CaseFilesCard;
