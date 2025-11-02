"use server";

import { getAuthSession } from "@/data/auth";
import { Appointment, AppointmentType } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createZoomMeeting } from "@/lib/zoom";
import { sendAppointmentConfirmationEmail } from "./email";

export async function getAppointments() {
  await getAuthSession();
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        createdBy: true,
        client: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });
    return { success: true, data: appointments };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export type CreateAppointment = Omit<
  Appointment,
  "id" | "createdAt" | "updatedAt" | "createdById"
>;

export async function createAppointment(formData: CreateAppointment) {
  const session = await getAuthSession();
  try {
    const { title, description, startDate, endDate, variant, clientId, type } =
      formData;

    let meetingUrl: string | undefined;
    if (type === "ONLINE") {
      const meeting = await createZoomMeeting(title, startDate);
      meetingUrl = meeting.join_url;
    }

    const newAppointment = await prisma.appointment.create({
      data: {
        title,
        description,
        startDate,
        endDate,
        variant,
        clientId,
        type,
        meetingUrl,
        createdById: session.user.id,
      },
    });

    await sendAppointmentConfirmationEmail(newAppointment);

    revalidatePath("/appointments");
    return { success: true, data: newAppointment };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateAppointment(
  id: string,
  formData: Partial<CreateAppointment>
) {
  await getAuthSession();
  try {
    const { title, startDate, type } = formData;
    let meetingUrl: string | undefined;

    if (type === "ONLINE") {
      if (title && startDate) {
        const meeting = await createZoomMeeting(title, startDate);
        meetingUrl = meeting.join_url;
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...formData,
        meetingUrl,
        updatedAt: new Date(),
      },
    });

    await sendAppointmentConfirmationEmail(updatedAppointment);

    revalidatePath("/appointments");
    return { success: true, data: updatedAppointment };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteAppointment(id: string) {
  await getAuthSession();
  try {
    await prisma.appointment.delete({
      where: { id },
    });

    revalidatePath("/appointments");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
