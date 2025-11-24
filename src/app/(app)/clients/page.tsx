import { getArchivedUsers, getUsers } from "@/data/users";
import { columns, archivedColumns } from "./columns";
import { ClientDataTable } from "@/components/client-data-table";
import { UserRole } from "@/generated/prisma";
import { AddClientModal } from "@/components/add-client-modal";
import { Search } from "./search";
import { Suspense } from "react";
import TableLoader from "@/components/table-loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { searchParamsCache } from "./searchParams";
import type { ColumnDef } from "@tanstack/react-table";
import type { User } from "@/generated/prisma";

async function ActiveClients({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { query } = await searchParamsCache.parse(searchParams);
  const clients = await getUsers({ role: UserRole.CLIENT, query });

  return (
    <Suspense fallback={<TableLoader />}>
      <ClientDataTable columns={columns as ColumnDef<User>[]} data={clients} />
    </Suspense>
  );
}

async function ArchivedClients({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { query } = await searchParamsCache.parse(searchParams);
  const clients = await getArchivedUsers({ role: UserRole.CLIENT, query });

  return (
    <Suspense fallback={<TableLoader />}>
      <ClientDataTable
        columns={archivedColumns as ColumnDef<User>[]}
        data={clients}
      />
    </Suspense>
  );
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <div className="container mx-auto py-10 px-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Client History</h1>
        <div className="flex items-center gap-2">
          <Search />
          <AddClientModal />
        </div>
      </div>
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          <ActiveClients searchParams={searchParams} />
        </TabsContent>
        <TabsContent value="archived">
          <ArchivedClients searchParams={searchParams} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
