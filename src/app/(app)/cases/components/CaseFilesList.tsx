"use client";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import {
  FileText,
  ImageIcon,
  File,
  Archive,
  EllipsisVertical,
  Loader2,
} from "lucide-react";
import { Document } from "@/generated/prisma";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { archiveDocument } from "@/actions/document";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

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
  if (!type) return <File className="h-8 w-8 text-gray-400" />;

  if (type.startsWith("image/")) {
    return <ImageIcon className="h-8 w-8 text-blue-500" />;
  } else if (type === "application/pdf") {
    return <FileText className="h-8 w-8 text-red-500" />;
  } else if (type.includes("word") || type.includes("document")) {
    return <FileText className="h-8 w-8 text-blue-600" />;
  } else if (type.includes("sheet") || type.includes("excel")) {
    return <FileText className="h-8 w-8 text-green-600" />;
  } else {
    return <File className="h-8 w-8 text-gray-400" />;
  }
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function CaseFilesList({
  documents,
  isLoading = false,
}: {
  documents?: Document[] & { signedUrl?: string };
  isLoading?: boolean;
}) {
  const router = useRouter();
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [documentToArchive, setDocumentToArchive] = useState<Document | null>(
    null
  );
  const [localDocuments, setLocalDocuments] = useState<Document[]>(documents || []);

  // Update local documents when props change
  React.useEffect(() => {
    setLocalDocuments(documents || []);
  }, [documents]);

  const handleArchiveClick = (document: Document) => {
    setDocumentToArchive(document);
    setOpenAlertDialog(true);
  };

  const confirmArchive = async () => {
    if (!documentToArchive) return;

    try {
      const result = await archiveDocument(documentToArchive.id);

      if (result.success) {
        // Remove from local state immediately for smooth animation
        setLocalDocuments(prev => prev.filter(doc => doc.id !== documentToArchive.id));
        toast.success("Document archived successfully");
        // Refresh after a short delay to sync with server
        setTimeout(() => {
        router.refresh();
        }, 300);
      } else {
        toast.error(result.error || "Failed to archive document");
      }
    } catch (error) {
      toast.error("Failed to archive document");
    } finally {
      setOpenAlertDialog(false);
      setDocumentToArchive(null);
    }
  };

  return (
    <div className="w-full mx-auto py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Documents
        </h2>
        <motion.p
          key={localDocuments.length}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground"
        >
          {localDocuments.length} document
          {localDocuments.length !== 1 ? "s" : ""} total
        </motion.p>
      </div>

      <Card className="p-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {isLoading && localDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Uploading files...</p>
            </div>
          ) : localDocuments && localDocuments.length > 0 ? (
            <AnimatePresence mode="popLayout" initial={false}>
              {localDocuments.map((document, index) => (
                <motion.div
                key={document.id}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ 
                    opacity: 0, 
                    y: 20, 
                    scale: 0.9,
                    height: 0,
                    marginBottom: 0,
                    paddingTop: 0,
                    paddingBottom: 0,
                  }}
                  transition={{
                    duration: 0.25,
                    delay: index * 0.03,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  layout
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors overflow-hidden"
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getFileIcon(document.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium text-foreground truncate">
                        {document.name}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                      <span>
                        {document.size
                          ? formatBytes(document.size)
                          : "Unknown size"}
                      </span>
                      <span>•</span>
                      <span>Uploaded {formatDate(document.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 ml-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={buttonVariants({
                        variant: "ghost",
                        size: "icon",
                      })}
                    >
                      <EllipsisVertical className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={e => {
                              e.preventDefault();
                              handleArchiveClick(document);
                            }}
                          >
                            <Archive className="mr-2 h-4 w-4" /> Archive
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you sure you want to archive this document?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action will move the document to the archive. You can
                              recover it later.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmArchive}>
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-center text-muted-foreground py-8"
            >
              No documents found.
            </motion.div>
          )}
        </div>
      </Card>
    </div>
  );
}
