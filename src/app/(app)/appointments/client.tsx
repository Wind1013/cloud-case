"use client";

import SchedulerWrapper from "@/components/schedule/_components/wrapper/schedular-wrapper";
import { SchedulerProvider } from "@/providers/schedular-provider";
import { AppointmentEvent } from "@/types";
import { User } from "@/generated/prisma";

const AppointmentClient = ({
  appointments,
  clients,
}: {
  appointments: AppointmentEvent[];
  clients: User[];
}) => {
  return (
    <div className="pt-4 px-8">
      <SchedulerProvider weekStartsOn="monday" initialState={appointments}>
        <SchedulerWrapper clients={clients} />
      </SchedulerProvider>
    </div>
  );
};
export default AppointmentClient;
