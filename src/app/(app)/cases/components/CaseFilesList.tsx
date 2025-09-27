"use client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download, FileText, ImageIcon, File } from "lucide-react";
import { Document } from "@/generated/prisma";

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
}: {
  documents?: Document[] & { signedUrl?: string };
}) {
  const handleView = (document: Document & { signedUrl?: string }) => {
    // Use signedUrl if available, fallback to url
    const urlToOpen = document.signedUrl || document.url;
    window.open(urlToOpen, "_blank");
  };

  const handleDownload = (document: Document & { signedUrl?: string }) => {
    // Use signedUrl if available, fallback to url
    const urlToDownload = document.signedUrl || document.url;
    const link = window.document.createElement("a");
    link.href = urlToDownload;
    link.download = document.name;
    link.click();
  };

  return (
    <div className="w-full mx-auto py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Documents
        </h2>
        <p className="text-muted-foreground">
          {documents?.length ?? 0} document
          {documents?.length !== 1 ? "s" : ""} total
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {documents && documents.length > 0 ? (
            documents.map(document => (
              <div
                key={document.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
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
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleView(document)}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(document)}
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No documents found.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
