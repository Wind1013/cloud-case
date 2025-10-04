import React from "react";
import SchedulerView from "../view/schedular-view";
import { User } from "@/generated/prisma";

export default function SchedulerWrapper({ clients }: { clients: User[] }) {
  return (
    <div className="w-full">
      <SchedulerView clients={clients} />
    </div>
  );
}
