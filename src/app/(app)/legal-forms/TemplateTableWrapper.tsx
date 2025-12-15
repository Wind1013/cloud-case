"use client";

import { TemplateDataTable } from "@/components/template-data-table";
import { createColumns } from "./columns";
import type { ColumnDef } from "@tanstack/react-table";
import type { Template } from "@/generated/prisma";

interface TemplateTableWrapperProps {
  templates: Template[];
  total: number;
  page: number;
  limit: number;
  query?: string;
  isArchived: boolean;
}

export function TemplateTableWrapper({
  templates,
  total,
  page,
  limit,
  query,
  isArchived,
}: TemplateTableWrapperProps) {
  const columns = createColumns(isArchived);

  return (
    <TemplateDataTable<Template, unknown>
      columns={columns as ColumnDef<Template, unknown>[]}
      data={templates ?? []}
      total={Number(total)}
      page={page}
      limit={limit}
      query={query}
    />
  );
}

