import { getAppointments } from "@/actions/appointment";
import AppointmentClient from "./client";
import { Event } from "@/types";
import { AppointmentVariant, User } from "@/generated/prisma";
import { getUsers } from "@/data/users";

const AppointmentPage = async () => {
  const { data: appointments } = await getAppointments();
  const clients = await getUsers({ role: "CLIENT" });

  const mappedAppointments: Event[] = appointments
    ? appointments.map((appointment) => ({
        id: appointment.id,
        title: appointment.title,
        description: appointment.description || "",
        startDate: appointment.startDate,
        endDate: appointment.endDate,
        variant: appointment.variant.toLowerCase() as Event["variant"],
        clientId: appointment.clientId || undefined,
      }))
    : [];

  return <AppointmentClient appointments={mappedAppointments} clients={clients as User[]} />;
};

export default AppointmentPage;