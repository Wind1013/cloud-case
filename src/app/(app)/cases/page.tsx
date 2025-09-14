import { CaseDataTable } from "@/components/case-data-table";
import React from "react";
import { generateMockCaseData } from "./mock-data";
import { getCases } from "@/actions/cases";

async function Cases() {
  const caseData = generateMockCaseData();
  const { data } = await getCases();

  if (!data) {
    return <h1>Error Fetching data</h1>;
  }

  const mappedData = data.map(item => ({
    id: item.id,
    title: item.title,
    description: item.description || "",
    lawyerId: item.lawyer.name,
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
        <CaseDataTable data={[...caseData, ...mappedData]} />
      </div>
    </div>
  );
}

export default Cases;
