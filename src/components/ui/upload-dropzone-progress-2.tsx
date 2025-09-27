"use client";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dot,
  type File,
  Upload,
  FileText,
  ImageIcon,
  Eye,
  Download,
} from "lucide-react";
import { useId } from "react";
import { useDropzone } from "react-dropzone";
import {
  FileUploadInfo,
  UploadHookControl,
  UploadStatus,
} from "better-upload/client";

type UploadDropzoneProgressProps = {
  control: UploadHookControl<true>;
  accept?: string;
  metadata?: Record<string, unknown>;
  description?:
    | {
        fileTypes?: string;
        maxFileSize?: string;
        maxFiles?: number;
      }
    | string;
  uploadOverride?: (
    ...args: Parameters<UploadHookControl<true>["upload"]>
  ) => void;

  // Add any additional props you need.
};

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
  );
}

export function UploadDropzoneProgress({
  control: { upload, isPending, progresses },
  accept,
  metadata,
  description,
  uploadOverride,
}: UploadDropzoneProgressProps) {
  const id = useId();

  const { getRootProps, getInputProps, isDragActive, inputRef } = useDropzone({
    onDrop: files => {
      if (files.length > 0) {
        if (uploadOverride) {
          uploadOverride(files, { metadata });
        } else {
          upload(files, { metadata });
        }
      }
      inputRef.current.value = "";
    },
    noClick: true,
  });

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "relative rounded-lg border border-dashed transition-colors",
          {
            "border-primary/70": isDragActive,
          }
        )}
      >
        <label
          {...getRootProps()}
          className={cn(
            "dark:bg-input/10 flex w-full min-w-72 cursor-pointer flex-col items-center justify-center rounded-lg bg-transparent px-2 py-6 transition-colors",
            {
              "text-muted-foreground cursor-not-allowed": isPending,
              "hover:bg-accent dark:hover:bg-accent/30": !isPending,
            }
          )}
          htmlFor={id}
        >
          <div className="my-2">
            <Upload className="size-6" />
          </div>

          <div className="mt-3 space-y-1 text-center">
            <p className="text-sm font-semibold">Drag and drop files here</p>

            <p className="text-muted-foreground max-w-64 text-xs">
              {typeof description === "string" ? (
                description
              ) : (
                <>
                  {description?.maxFiles &&
                    `You can upload ${description.maxFiles} file${
                      description.maxFiles !== 1 ? "s" : ""
                    }.`}{" "}
                  {description?.maxFileSize &&
                    `${description.maxFiles !== 1 ? "Each u" : "U"}p to ${
                      description.maxFileSize
                    }.`}{" "}
                  {description?.fileTypes &&
                    `Accepted ${description.fileTypes}.`}
                </>
              )}
            </p>
          </div>

          <input
            {...getInputProps()}
            type="file"
            multiple
            id={id}
            accept={accept}
            disabled={isPending}
          />
        </label>

        {isDragActive && (
          <div className="bg-background pointer-events-none absolute inset-0 rounded-lg">
            <div className="dark:bg-accent/30 bg-accent flex size-full flex-col items-center justify-center rounded-lg">
              <div className="my-2">
                <Upload className="size-6" />
              </div>

              <p className="mt-3 text-sm font-semibold">Drop files here</p>
            </div>
          </div>
        )}
      </div>

      {progresses.length > 0 && (
        <div className="space-y-2 w-full">
          {progresses.map(progress => (
            <FileProgressItem
              key={progress.objectKey}
              progress={progress}
              type={progress.type.startsWith("image/") ? "image" : "document"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FileProgressItem({
  progress,
  type,
}: {
  progress: FileUploadInfo<UploadStatus>;
  type: "document" | "image";
}) {
  const getUploadedTime = () => {
    // For demo purposes, showing "Just now" - in real app this would be actual timestamp
    return "Just now";
  };

  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        {type === "document" ? (
          <FileText className="h-5 w-5 text-primary" />
        ) : (
          <ImageIcon className="h-5 w-5 text-secondary" />
        )}
        <div className="flex-1">
          <p className="text-sm font-medium">{progress.name}</p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{formatBytes(progress.size)}</span>
            <Dot className="size-3" />
            {progress.progress < 1 && progress.status !== "failed" ? (
              <span>Uploading... {Math.round(progress.progress * 100)}%</span>
            ) : progress.status === "failed" ? (
              <span className="text-red-500">Failed</span>
            ) : (
              <span>Uploaded {getUploadedTime()}</span>
            )}
          </div>
          {/* {progress.progress < 1 && progress.status !== "failed" && ( */}
          <Progress className="h-1.5 mt-2" value={progress.progress * 100} />
          {/* )} */}
        </div>
      </div>
      {progress.progress >= 1 && progress.status !== "failed" && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
