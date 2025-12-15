"use server";

import { getAuthSession } from "@/data/auth";
import { Case, CaseStatus } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type CreateCase = Pick<
  Case,
  "title" | "description" | "clientId" | "type" | "status"
>;
export async function createCase(formData: CreateCase) {
  await getAuthSession();
  try {
    const { title, description, clientId, type, status } = formData;

    const newCase = await prisma.case.create({
      data: {
        title,
        description,
        clientId,
        type,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    revalidatePath("/cases");
    return { success: true, data: newCase };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateCase(id: string, formData: Partial<CreateCase>) {
  await getAuthSession();
  try {
    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        ...formData,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/cases");
    return { success: true, data: updatedCase };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateCaseStatus(id: string, status: CaseStatus) {
  await getAuthSession();
  try {
    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/cases");
    return { success: true, data: updatedCase };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function archiveCase(id: string) {
  await getAuthSession();
  try {
    // First, get the current case to save its status
    const existingCase = await prisma.case.findUnique({
      where: { id },
      select: {
        status: true,
        previousStatus: true,
      },
    });

    if (!existingCase) {
      return { success: false, error: "Case not found" };
    }

    // Only update previousStatus if the case is not already archived
    // If already archived, keep the existing previousStatus
    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        previousStatus:
          existingCase.status === "ARCHIVED"
            ? existingCase.previousStatus
            : existingCase.status,
        status: "ARCHIVED",
        updatedAt: new Date(),
      },
    });

    revalidatePath("/cases");
    return { success: true, data: updatedCase };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function unarchiveCase(id: string) {
  await getAuthSession();
  try {
    // Get the case to retrieve the previousStatus
    const existingCase = await prisma.case.findUnique({
      where: { id },
      select: {
        previousStatus: true,
      },
    });

    if (!existingCase) {
      return { success: false, error: "Case not found" };
    }

    // Restore the previous status, or default to PRELIMINARY_CONFERENCE if none exists
    const restoredStatus =
      existingCase.previousStatus ?? "PRELIMINARY_CONFERENCE";

    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        status: restoredStatus,
        previousStatus: null, // Clear previousStatus after unarchiving
        updatedAt: new Date(),
      },
    });

    revalidatePath("/cases");
    return { success: true, data: updatedCase };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteCase(id: string) {
  await getAuthSession();
  try {
    await prisma.case.delete({
      where: { id },
    });

    revalidatePath("/cases");
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getPendingCasesCount() {
  await getAuthSession();
  try {
    const count = await prisma.case.count();
    return { success: true, data: count };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getCasesChangePercentage() {
  await getAuthSession();
  try {
    const now = new Date();
    
    // Last 30 days
    const last30Days = new Date(now);
    last30Days.setDate(now.getDate() - 30);
    
    // Previous 30 days (30-60 days ago)
    const previous30DaysStart = new Date(now);
    previous30DaysStart.setDate(now.getDate() - 60);
    const previous30DaysEnd = new Date(now);
    previous30DaysEnd.setDate(now.getDate() - 30);

    const last30DaysCount = await prisma.case.count({
      where: {
        createdAt: {
          gte: last30Days,
          lt: now,
        },
      },
    });

    const previous30DaysCount = await prisma.case.count({
      where: {
        createdAt: {
          gte: previous30DaysStart,
          lt: previous30DaysEnd,
        },
      },
    });

    if (previous30DaysCount === 0) {
      return { success: true, data: last30DaysCount > 0 ? 100 : 0 };
    }

    const changePercentage =
      ((last30DaysCount - previous30DaysCount) / previous30DaysCount) * 100;

    return { success: true, data: parseFloat(changePercentage.toFixed(2)) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getCasesChartData(days: number = 90) {
  await getAuthSession();
  try {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get all cases in the date range
    const cases = await prisma.case.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: now,
        },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
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

    // Count cases per date
    cases.forEach((c) => {
      const dateStr = c.createdAt.toISOString().split("T")[0];
      const current = dateMap.get(dateStr) || 0;
      dateMap.set(dateStr, current + 1);
    });

    // Convert to array format
    const chartData = Array.from(dateMap.entries())
      .map(([date, count]) => ({
        date,
        cases: count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return { success: true, data: chartData };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
