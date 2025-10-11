import { getTemplates } from "@/actions/template";
import { TemplateDataTable } from "@/components/template-data-table";
import { columns } from "./columns";
import type { ColumnDef } from "@tanstack/react-table";
import type { Template } from "@/generated/prisma";
import Link from "next/link";
import { Suspense } from "react";
import DocumentsLoading from "../documents/loader";
import { Search } from "../documents/search";
import { searchParamsCache } from "../documents/searchParams";
import { buttonVariants } from "@/components/ui/button";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { query, page, limit } = await searchParamsCache.parse(searchParams);

  const { data: templates, total } = await getTemplates({ page, limit, query });

  const searchKey = `${query}-${page}-${limit}`;

  return (
    <div className="p-8">
      <div className="flex flex-col items-center justify-between mb-4">
        <div className="w-full flex justify-between mb-2">
          <h1 className="text-2xl font-bold">Templates</h1>
          <div className="flex items-center gap-2">
            <Search />
            <Link href="/templates/create" className={buttonVariants()}>
              Create Template
            </Link>
          </div>
        </div>
        <Suspense key={searchKey} fallback={<DocumentsLoading />}>
          <TemplateDataTable<Template, unknown>
            columns={columns as ColumnDef<Template, unknown>[]}
            data={templates ?? []}
            total={Number(total)}
            page={page}
            limit={limit}
            query={query}
          />
        </Suspense>
      </div>
    </div>
  );
}
