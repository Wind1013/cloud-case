"use server";

import { getAuthSession } from "@/data/auth";
import { Appointment } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

export type CreateAppointment = Omit<Appointment, "id" | "createdAt" | "updatedAt" | "createdById">;

export async function createAppointment(formData: CreateAppointment) {
  const session = await getAuthSession();
  try {
    const { title, description, startDate, endDate, variant, clientId } = formData;

    const newAppointment = await prisma.appointment.create({
      data: {
        title,
        description,
        startDate,
        endDate,
        variant,
        clientId,
        createdById: session.user.id,
      },
    });

    revalidatePath("/appointments");
    return { success: true, data: newAppointment };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateAppointment(id: string, formData: Partial<CreateAppointment>) {
  await getAuthSession();
  try {
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        ...formData,
        updatedAt: new Date(),
      },
    });

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
