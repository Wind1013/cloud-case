"use client";

import { DocumentDataTable } from "@/components/document-data-table";
import { createColumns } from "./columns";
import type { ColumnDef } from "@tanstack/react-table";
import type { Document } from "@/generated/prisma";

interface DocumentTableWrapperProps {
  documents: Document[];
  total: number;
  page: number;
  limit: number;
  query?: string;
  isArchived: boolean;
}

export function DocumentTableWrapper({
  documents,
  total,
  page,
  limit,
  query,
  isArchived,
}: DocumentTableWrapperProps) {
  const columns = createColumns(isArchived);

  return (
    <DocumentDataTable<Document, unknown>
      columns={columns as ColumnDef<Document, unknown>[]}
      data={documents ?? []}
      total={Number(total)}
      page={page}
      limit={limit}
      query={query}
    />
  );
}

