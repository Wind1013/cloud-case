import { getUsers } from "@/data/users";
import { columns } from "./columns";
import { ClientDataTable } from "@/components/client-data-table";
import { UserRole } from "@/generated/prisma";
import { auth } from "@/lib/auth";
import { AddClientModal } from "@/components/add-client-modal";

export default async function ClientsPage() {
  const clients = await getUsers({ role: UserRole.CLIENT });

  return (
    <div className="container mx-auto py-10 px-10">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clients</h1>
        <AddClientModal />
      </div>
      <ClientDataTable columns={columns} data={clients} />
    </div>
  );
}
