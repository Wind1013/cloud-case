"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Case } from "@/generated/prisma";

export const columns: ColumnDef<Case>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => {
      const caseData = row.original;
      return <Link href={`/cases/${caseData.id}`}>{caseData.title}</Link>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");
      return <Badge>{status as string}</Badge>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const formatted = date.toLocaleDateString();
      return <div className="font-medium">{formatted}</div>;
    },
  },
];
