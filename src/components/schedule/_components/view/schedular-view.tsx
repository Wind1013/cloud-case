"use client";


import { User } from "@/generated/prisma";
import SchedulerViewFilteration from "./schedular-view-filteration";

export default function SchedulerView({ clients }: { clients: User[] }) {

  return (
    <div className="flex flex-col gap-6">
      <SchedulerViewFilteration clients={clients} />
    </div>
  );
}
