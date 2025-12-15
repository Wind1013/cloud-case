"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Document as PrismaDocument, Case } from "@/generated/prisma";
import { archiveDocument, unarchiveDocument } from "@/actions/document";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Document = PrismaDocument & {
  case: Case;
  signedUrl?: string;
};

import { Checkbox } from "@/components/ui/checkbox";

function formatDocumentType(mimeType: string): string {
  switch (mimeType) {
    case "application/pdf":
      return "PDF";
    case "application/msword":
      return "DOC";
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return "DOCX";
    case "application/vnd.ms-excel":
      return "XLS";
    case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      return "XLSX";
    case "text/plain":
      return "TXT";
    case "image/jpeg":
    case "image/png":
    case "image/gif":
      return "Image";
    default:
      return mimeType.split("/")[1]?.toUpperCase() || mimeType;
  }
}

export const createColumns = (isArchived: boolean = false): ColumnDef<Document>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "case.title",
    header: "Case",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return <div>{formatDocumentType(type)}</div>;
    },
  },
  {
    accessorKey: "size",
    header: "Size",
    cell: ({ row }) => {
      const sizeInBytes = parseFloat(row.getValue("size"));
      const sizeInKB = sizeInBytes / 1024;
      const formatted = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 2,
      }).format(sizeInKB);
      return <div>{formatted} KB</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const formatted = new Intl.DateTimeFormat("en-US").format(date);
      return <div>{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <DocumentActions document={row.original} isArchived={isArchived} />;
    },
  },
];

// Component for document actions
function DocumentActions({ document, isArchived }: { document: Document; isArchived: boolean }) {
  const router = useRouter();

  const handleArchive = async () => {
    const result = await archiveDocument(document.id);
    if (result.success) {
      toast.success("Document archived successfully");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to archive document");
    }
  };

  const handleUnarchive = async () => {
    const result = await unarchiveDocument(document.id);
    if (result.success) {
      toast.success("Document unarchived successfully");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to unarchive document");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!isArchived ? (
          <>
            <DropdownMenuItem asChild>
              <Link href={`/cases/${document.caseId}`}>View Case</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleArchive}>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={handleUnarchive}>
              <ArchiveRestore className="mr-2 h-4 w-4" />
              Unarchive
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Export default columns for backward compatibility
export const columns = createColumns(false);
