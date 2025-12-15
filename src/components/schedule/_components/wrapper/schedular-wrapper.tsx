import React from "react";
import SchedulerView from "../view/schedular-view";
import { User, Case } from "@/generated/prisma";

export default function SchedulerWrapper({ clients, cases }: { clients: User[]; cases: Case[] }) {
  return (
    <div className="w-full">
      <SchedulerView clients={clients} cases={cases} />
    </div>
  );
}
