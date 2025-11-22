"use client";
import { DeleteClientDialog } from "@/components/delete-client-dialog";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/generated/prisma";
import Link from "next/link";
import { archiveUser, unarchiveUser } from "@/actions/users";
import { toast } from "sonner";

async function onArchive(id: string) {
  const result = await archiveUser(id);
  if (result.success) {
    toast.success(result.success);
  } else {
    toast.error(result.error);
  }
}

async function onUnarchive(id: string) {
  const result = await unarchiveUser(id);
  if (result.success) {
    toast.success(result.success);
  } else {
    toast.error(result.error);
  }
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const client = row.original;
      return <Link href={`/clients/${client.id}`}>{client.name}</Link>;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const formatted = date.toLocaleDateString();
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const client = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(client.id)}
            >
              Copy client ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {client.isArchived ? (
              <DropdownMenuItem onClick={() => onUnarchive(client.id)}>
                Unarchive
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onArchive(client.id)}>
                Archive
              </DropdownMenuItem>
            )}
            <DeleteClientDialog clientId={client.id} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
