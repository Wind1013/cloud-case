import { CaseDataTable } from "@/components/case-data-table";
import React, { Suspense } from "react";
import { getCases } from "@/data/cases";
import { Search } from "./search";
import TableLoader from "@/components/table-loader";

interface CasesPageProps {
  searchParams: Promise<{
    query?: string;
  }>;
}

async function Cases({ searchParams }: CasesPageProps) {
  const { query } = await searchParams;
  const { data } = await getCases(query);

  if (!data) {
    return <h1>Error Fetching data</h1>;
  }

  const mappedData = data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description || "",
    clientId: item.client.name,
    status: "IN_PROGRESS" as
      | "PENDING"
      | "IN_PROGRESS"
      | "COMPLETED"
      | "DISMISSED",
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  return (
    <div className="py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between px-4 lg:px-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Case Management</h1>
            <p className="text-muted-foreground">
              Manage and track legal cases
            </p>
          </div>
          <div className="flex items-center gap-2 w-80">
            <Search />
          </div>
        </div>
        <Suspense fallback={<TableLoader />}>
          <CaseDataTable data={mappedData} />
        </Suspense>
      </div>
    </div>
  );
}

export default Cases;
