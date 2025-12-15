"use client";

import { User, Case } from "@/generated/prisma";
import SchedulerViewFilteration from "./schedular-view-filteration";

export default function SchedulerView({ clients, cases }: { clients: User[]; cases: Case[] }) {
  return (
    <div className="flex flex-col gap-6">
      <SchedulerViewFilteration clients={clients} cases={cases} />
    </div>
  );
}
