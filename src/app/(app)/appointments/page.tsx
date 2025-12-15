import { getAppointments } from "@/actions/appointment";
import AppointmentClient from "./client";
import { AppointmentEvent } from "@/types";
import { AppointmentVariant, User, Case } from "@/generated/prisma";
import { getUsers } from "@/data/users";
import { getCases } from "@/data/cases";

const AppointmentPage = async () => {
  const { data: appointments } = await getAppointments();
  const { data: clients } = await getUsers({ role: "CLIENT", limit: 1000 });
  const { data: cases } = await getCases({});

  const mappedAppointments: AppointmentEvent[] = appointments
    ? appointments.map(appointment => ({
        id: appointment.id,
        title: appointment.title,
        description: appointment.description || "",
        startDate: appointment.startDate,
        endDate: appointment.endDate,
        variant:
          appointment.variant.toLowerCase() as AppointmentEvent["variant"],
        clientId: appointment.clientId || undefined,
        type: appointment.type,
        meetingUrl: appointment.meetingUrl || "",
      }))
    : [];

  return (
    <AppointmentClient
      appointments={mappedAppointments}
      clients={clients}
      cases={(cases || []) as Case[]}
    />
  );
};

export default AppointmentPage;
