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

export async function getAppointmentById(id: string) {
  await getAuthSession();
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        createdBy: true,
        client: true,
      },
    });
    if (!appointment) {
      return { success: false, error: "Appointment not found" };
    }
    return { success: true, data: appointment };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getTodaysAppointmentsCount() {
  await getAuthSession();
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await prisma.appointment.count({
      where: {
        startDate: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
    return { success: true, data: count };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getAppointmentsChangePercentage() {
  await getAuthSession();
  try {
    const now = new Date();
    
    // Last 7 days
    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 7);
    
    // Previous 7 days (7-14 days ago)
    const previous7DaysStart = new Date(now);
    previous7DaysStart.setDate(now.getDate() - 14);
    const previous7DaysEnd = new Date(now);
    previous7DaysEnd.setDate(now.getDate() - 7);

    const last7DaysCount = await prisma.appointment.count({
      where: {
        startDate: {
          gte: last7Days,
          lt: now,
        },
      },
    });

    const previous7DaysCount = await prisma.appointment.count({
      where: {
        startDate: {
          gte: previous7DaysStart,
          lt: previous7DaysEnd,
        },
      },
    });

    if (previous7DaysCount === 0) {
      return { success: true, data: last7DaysCount > 0 ? 100 : 0 };
    }

    const changePercentage =
      ((last7DaysCount - previous7DaysCount) / previous7DaysCount) * 100;

    return { success: true, data: parseFloat(changePercentage.toFixed(2)) };
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

    // Check if client already has an appointment on the same day
    if (clientId) {
      const appointmentDate = new Date(startDate);
      const dayStart = new Date(appointmentDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(appointmentDate);
      dayEnd.setHours(23, 59, 59, 999);

      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          clientId,
          startDate: {
            gte: dayStart,
            lte: dayEnd,
          },
        },
      });

      if (existingAppointment) {
        return {
          success: false,
          error: "This client already has an appointment scheduled for this day. Please choose a different day or client.",
        };
      }
    }

    let meetingUrl: string | undefined;
    let zoomWarning: string | undefined;
    if (type === "ONLINE") {
      try {
        const meeting = await createZoomMeeting(title, startDate);
        meetingUrl = meeting.join_url;
      } catch (zoomError) {
        console.error("Failed to create Zoom meeting:", zoomError);
        // Provide a user-friendly message without technical details
        zoomWarning = "Zoom meeting could not be created. The appointment was saved without a meeting link. You can add a meeting URL manually later.";
        // Continue with appointment creation even if Zoom fails
        // The appointment will be created without a meeting URL
        // User can manually add the meeting URL later if needed
      }
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
    return { success: true, data: newAppointment, warning: zoomWarning };
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
    let zoomWarning: string | undefined;

    if (type === "ONLINE") {
      if (title && startDate) {
        try {
          const meeting = await createZoomMeeting(title, startDate);
          meetingUrl = meeting.join_url;
        } catch (zoomError) {
          console.error("Failed to create Zoom meeting:", zoomError);
          // Provide a user-friendly message without technical details
          zoomWarning = "Zoom meeting could not be created. The appointment was updated without a meeting link. You can add a meeting URL manually later.";
          // Continue with appointment update even if Zoom fails
          // The appointment will be updated without a meeting URL
        }
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
    return { success: true, data: updatedAppointment, warning: zoomWarning };
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

export async function getAppointmentsChartData(days: number = 90) {
  await getAuthSession();
  try {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get all appointments in the date range (based on startDate)
    const appointments = await prisma.appointment.findMany({
      where: {
        startDate: {
          gte: startDate,
          lte: now,
        },
      },
      select: {
        startDate: true,
      },
      orderBy: {
        startDate: "asc",
      },
    });

    // Group by date
    const dateMap = new Map<string, number>();
    
    // Initialize all dates in range with 0
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      dateMap.set(dateStr, 0);
    }

    // Count appointments per date
    appointments.forEach((a) => {
      const dateStr = a.startDate.toISOString().split("T")[0];
      const current = dateMap.get(dateStr) || 0;
      dateMap.set(dateStr, current + 1);
    });

    // Convert to array format
    const chartData = Array.from(dateMap.entries())
      .map(([date, count]) => ({
        date,
        appointments: count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { success: true, data: chartData };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
