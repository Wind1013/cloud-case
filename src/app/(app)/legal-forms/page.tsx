import { getArchivedTemplates, getTemplates } from "@/actions/template";
import { TemplateDataTable } from "@/components/template-data-table";
import { columns } from "./columns";
import type { ColumnDef } from "@tanstack/react-table";
import type { Template } from "@/generated/prisma";
import Link from "next/link";
import { Suspense } from "react";
import TableLoader from "../../../components/table-loader";
import { Search } from "../documents/search";
import { searchParamsCache } from "../documents/searchParams";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
async function ActiveTemplates({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { query, page, limit } = await searchParamsCache.parse(searchParams);
  const { data: templates, total } = await getTemplates({ page, limit, query });
  const searchKey = `${query}-${page}-${limit}`;

  return (
    <Suspense key={searchKey} fallback={<TableLoader />}>
      <TemplateDataTable<Template, unknown>
        columns={columns as ColumnDef<Template, unknown>[]}
        data={templates ?? []}
        total={Number(total)}
        page={page}
        limit={limit}
        query={query}
      />
    </Suspense>
  );
}

async function ArchivedTemplates({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { query, page, limit } = await searchParamsCache.parse(searchParams);
  const { data: templates, total } = await getArchivedTemplates({
    page,
    limit,
    query,
  });
  const searchKey = `${query}-${page}-${limit}`;

  return (
    <Suspense key={searchKey} fallback={<TableLoader />}>
      <TemplateDataTable<Template, unknown>
        columns={columns as ColumnDef<Template, unknown>[]}
        data={templates ?? []}
        total={Number(total)}
        page={page}
        limit={limit}
        query={query}
      />
    </Suspense>
  );
}

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="p-8">
      <div className="flex flex-col items-center justify-between mb-4">
        <div className="w-full flex justify-between mb-2">
          <h1 className="text-2xl font-bold">Legal Forms</h1>
          <div className="flex items-center gap-2">
            <Search />
            <Link href="/legal-forms/create" className={buttonVariants()}>
              Create Form
            </Link>
          </div>
        </div>
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <ActiveTemplates searchParams={searchParams} />
          </TabsContent>
          <TabsContent value="archived">
            <ArchivedTemplates searchParams={searchParams} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
