import { getUserById } from "@/data/users";
import { notFound } from "next/navigation";
import { EditClientForm } from "./edit-client-form";

type Props = {
  params: {
    id: string;
  };
};
export default async function EditClientPage({ params }: Props) {
  const user = await getUserById(params.id);

  if (!user) {
    notFound();
  }

  return <EditClientForm user={user} />;
}
