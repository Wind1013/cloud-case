// app/documents/page.tsx
import { getDocuments } from "@/data/documents";
import { Suspense } from "react";
import DocumentsLoading from "./loader";
import { Search } from "./search";
import { DocumentDataTable } from "@/components/document-data-table";
import { columns } from "./columns";
import type { ColumnDef } from "@tanstack/react-table";
import type { Document } from "@/generated/prisma";
import { searchParamsCache } from "./searchParams";

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { query, page, limit } = await searchParamsCache.parse(searchParams);

  const { data: documents, total } = await getDocuments({ page, limit, query });

  const searchKey = `${query}-${page}-${limit}`;

  return (
    <div className="p-8">
      <div className="flex flex-col items-center justify-between mb-4">
        <div className="w-full flex justify-between mb-2">
          <h1 className="text-2xl font-bold">Documents</h1>
          <div className="flex items-center gap-2">
            <Search />
          </div>
        </div>
        <Suspense key={searchKey} fallback={<DocumentsLoading />}>
          <DocumentDataTable<Document, unknown>
            columns={columns as ColumnDef<Document, unknown>[]}
            data={documents ?? []}
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
