import { getUsers } from "@/data/users";
import { columns } from "./columns";
import { ClientDataTable } from "@/components/client-data-table";
import { UserRole } from "@/generated/prisma";
import { AddClientModal } from "@/components/add-client-modal";
import { Search } from "./search";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams?: {
    query?: string;
  };
}) {
  const query = searchParams?.query || "";
  const clients = await getUsers({ role: UserRole.CLIENT, query });

  return (
    <div className="container mx-auto py-10 px-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clients</h1>
        <div className="flex items-center gap-2">
          <Search />
          <AddClientModal />
        </div>
      </div>
      <ClientDataTable columns={columns} data={clients} />
    </div>
  );
}
