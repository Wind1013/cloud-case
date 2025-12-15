import { getArchivedTemplates, getTemplates } from "@/actions/template";
import { TemplateTableWrapper } from "./TemplateTableWrapper";
import Link from "next/link";
import { Suspense } from "react";
import TableLoader from "../../../components/table-loader";
import { Search } from "../documents/search";
import { searchParamsCache } from "../documents/searchParams";
import { buttonVariants } from "@/components/ui/button";
import { TabsWrapper } from "./tabs-wrapper";
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
      <TemplateTableWrapper
        templates={templates ?? []}
        total={Number(total)}
        page={page}
        limit={limit}
        query={query}
        isArchived={false}
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
      <TemplateTableWrapper
        templates={templates ?? []}
        total={Number(total)}
        page={page}
        limit={limit}
        query={query}
        isArchived={true}
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
        <TabsWrapper
          activeContent={<ActiveTemplates searchParams={searchParams} />}
          archivedContent={<ArchivedTemplates searchParams={searchParams} />}
        />
      </div>
    </div>
  );
}
