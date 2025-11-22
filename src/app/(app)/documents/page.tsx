// app/documents/page.tsx
import { getDocuments, getArchivedDocuments } from "@/data/documents";
import { Suspense } from "react";
import TableLoader from "../../../components/table-loader";
import { Search } from "./search";
import { DocumentDataTable } from "@/components/document-data-table";
import { columns } from "./columns";
import type { ColumnDef } from "@tanstack/react-table";
import type { Document } from "@/generated/prisma";
import { searchParamsCache } from "./searchParams";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

async function ActiveDocuments({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { query, page, limit } = await searchParamsCache.parse(searchParams);
  const { data: documents, total } = await getDocuments({ page, limit, query });
  const searchKey = `${query}-${page}-${limit}`;

  return (
    <Suspense key={searchKey} fallback={<TableLoader />}>
      <DocumentDataTable<Document, unknown>
        columns={columns as ColumnDef<Document, unknown>[]}
        data={documents ?? []}
        total={Number(total)}
        page={page}
        limit={limit}
        query={query}
      />
    </Suspense>
  );
}

async function ArchivedDocuments({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { query, page, limit } = await searchParamsCache.parse(searchParams);
  const { data: documents, total } = await getArchivedDocuments({
    page,
    limit,
    query,
  });
  const searchKey = `${query}-${page}-${limit}`;

  return (
    <Suspense key={searchKey} fallback={<TableLoader />}>
      <DocumentDataTable<Document, unknown>
        columns={columns as ColumnDef<Document, unknown>[]}
        data={documents ?? []}
        total={Number(total)}
        page={page}
        limit={limit}
        query={query}
      />
    </Suspense>
  );
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="p-8">
      <div className="flex flex-col items-center justify-between mb-4">
        <div className="w-full flex justify-between mb-2">
          <h1 className="text-2xl font-bold">Legal Documents</h1>
          <div className="flex items-center gap-2">
            <Search />
          </div>
        </div>
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <ActiveDocuments searchParams={searchParams} />
          </TabsContent>
          <TabsContent value="archived">
            <ArchivedDocuments searchParams={searchParams} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
