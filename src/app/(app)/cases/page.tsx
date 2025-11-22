import { CaseDataTable } from "@/components/case-data-table";
import React, { Suspense } from "react";
import { getCases } from "@/data/cases";
import { Search } from "./search";
import TableLoader from "@/components/table-loader";
import { CaseFilters } from "./CaseFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaseStatus } from "@/generated/prisma";

interface CasesPageProps {
  searchParams: Promise<{
    query?: string;
    type?: string | string[];
    status?: string | string[];
  }>;
}

const parseToArray = (param?: string | string[]) => {
  if (!param) return undefined;
  if (Array.isArray(param)) return param;
  return param
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
};

async function ActiveCases({ searchParams }: CasesPageProps) {
  const { query, type, status } = await searchParams;
  const activeStatuses = Object.values(CaseStatus).filter(
    s => s !== "ARCHIVED"
  );

  const { data } = await getCases({
    query,
    types: parseToArray(type),
    statuses: status ? parseToArray(status) : activeStatuses,
  });

  if (!data) {
    return <h1>Error Fetching data</h1>;
  }

  const mappedData = data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description ?? "",
    clientId: item.client.name,
    status: item.status,
    type: item.type,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  return (
    <Suspense fallback={<TableLoader />}>
      <CaseDataTable data={mappedData} />
    </Suspense>
  );
}

async function ArchivedCases({ searchParams }: CasesPageProps) {
  const { query, type } = await searchParams;
  const { data } = await getCases({
    query,
    types: parseToArray(type),
    statuses: ["ARCHIVED"],
  });

  if (!data) {
    return <h1>Error Fetching data</h1>;
  }

  const mappedData = data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description ?? "",
    clientId: item.client.name,
    status: item.status,
    type: item.type,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  return (
    <Suspense fallback={<TableLoader />}>
      <CaseDataTable data={mappedData} />
    </Suspense>
  );
}

async function CasesPage({ searchParams }: CasesPageProps) {
  return (
    <div className="py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between px-4 lg:px-6 gap-10 mb-4">
          <div>
            <h1 className="text-2xl font-bold">Case Management</h1>
            <p className="text-muted-foreground">
              Manage and track legal cases
            </p>
          </div>
          <div className="flex flex-[0.6] items-center gap-2">
            <CaseFilters />
            <Search />
          </div>
        </div>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="ml-4">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            <ActiveCases searchParams={searchParams} />
          </TabsContent>
          <TabsContent value="archived">
            <ArchivedCases searchParams={searchParams} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default CasesPage;
