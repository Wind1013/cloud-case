"use client";

import { useTransition } from "react";
import { deleteAppointment } from "@/actions/appointment";
import SchedulerWrapper from "@/components/schedule/_components/wrapper/schedular-wrapper";
import { SchedulerProvider } from "@/providers/schedular-provider";
import { AppointmentEvent } from "@/types";
import { User, Case } from "@/generated/prisma";
import { toast } from "sonner";

const AppointmentClient = ({
  appointments,
  clients,
  cases,
}: {
  appointments: AppointmentEvent[];
  clients: User[];
  cases: Case[];
}) => {
  const [isPending, startTransition] = useTransition();

  const handleDeleteAppointment = (id: string) => {
    startTransition(async () => {
      const response = await deleteAppointment(id);
      if (response.success) {
        toast.success("Appointment deleted successfully");
      } else {
        toast.error(response.error);
      }
    });
  };

  return (
    <div className="pt-4 px-8">
      <SchedulerProvider
        weekStartsOn="monday"
        initialState={appointments}
        onDeleteEvent={handleDeleteAppointment}
      >
        <SchedulerWrapper clients={clients} cases={cases} />
      </SchedulerProvider>
    </div>
  );
};
export default AppointmentClient;
