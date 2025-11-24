import { ClientCasesTable } from "@/components/client-cases-table";
import { columns } from "@/components/client-cases-columns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  Cake,
  User as UserIcon,
  Calendar,
  MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { Notes } from "@/components/notes";
import { getUserById } from "@/data/users";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const client = await getUserById(params.id);

  if (!client) {
    notFound();
  }

  const getInitials = (name: string) => {
    const names = name.split(" ");
    const initials = names.map((n) => n[0]).join("");
    return initials.toUpperCase();
  };

  return (
    <div className="container mx-auto py-10 px-10">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={client.image || ""} />
              <AvatarFallback className="text-4xl">
                {getInitials(client.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-4xl">{client.name}</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
                {client.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{client.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <Link href={`/clients/${client.id}/edit`}>
            <Button>Edit</Button>
          </Link>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold">Gender:</span>
            <span>{client.gender}</span>
          </div>
          <div className="flex items-center gap-2">
            <Cake className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold">Birthday:</span>
            <span>
              {client.birthday
                ? format(new Date(client.birthday), "PPP")
                : "N/A"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold">Client Since:</span>
            <span>{format(new Date(client.createdAt), "PPP")}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Case History</h2>
          <ClientCasesTable columns={columns} data={client.clientCases} />
        </div>
        <div>
          <Notes notes={client.notes} clientId={client.id} />
        </div>
      </div>
    </div>
  );
}
