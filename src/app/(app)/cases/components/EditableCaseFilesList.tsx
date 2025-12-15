"use client";

import { Document } from "@/generated/prisma";
import { FileText, ImageIcon, File, X } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { deleteDocument } from "@/actions/document";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

const getFileIcon = (type: string | null) => {
  if (!type) return <File className="h-5 w-5 text-gray-400" />;

  if (type.startsWith("image/")) {
    return <ImageIcon className="h-5 w-5 text-blue-500" />;
  } else if (type === "application/pdf") {
    return <FileText className="h-5 w-5 text-red-500" />;
  } else if (type.includes("word") || type.includes("document")) {
    return <FileText className="h-5 w-5 text-blue-600" />;
  } else if (type.includes("sheet") || type.includes("excel")) {
    return <FileText className="h-5 w-5 text-green-600" />;
  } else {
    return <File className="h-5 w-5 text-gray-400" />;
  }
};

export default function EditableCaseFilesList({
  documents: initialDocuments,
  onDelete,
}: {
  documents?: Document[];
  onDelete?: () => void;
}) {
  // Update local state when props change
  const [documents, setDocuments] = React.useState<Document[]>(initialDocuments || []);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setDocuments(initialDocuments || []);
  }, [initialDocuments]);

  const handleDelete = async (documentId: string) => {
    try {
      setDeletingId(documentId);
      const result = await deleteDocument(documentId);
      
      if (result.success) {
        // Remove from local state immediately for smooth UI
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        toast.success("File deleted successfully");
        // Call onDelete callback to refresh parent component
        if (onDelete) {
          onDelete();
        }
      } else {
        toast.error(result.error || "Failed to delete file");
      }
    } catch (error) {
      toast.error("Failed to delete file");
      console.error("Error deleting document:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (!documents || documents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mt-4">
      <p className="text-sm font-medium text-muted-foreground">
        Existing Files ({documents.length})
      </p>
      <div className="space-y-2">
        {documents.map(document => (
          <div
            key={document.id}
            className="flex items-center p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="flex-shrink-0">
                {getFileIcon(document.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {document.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {document.size ? formatBytes(document.size) : "Unknown size"}
                </p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={deletingId === document.id}
                >
                  {deletingId === document.id ? (
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete File</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{document.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(document.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </div>
    </div>
  );
}

