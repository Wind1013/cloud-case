import "server-only";

import prisma from "@/lib/prisma";
import { UserRole } from "@/generated/prisma";

export async function getNewClientsGrowthRate() {
  try {
    const now = new Date();

    // Calculate clients for the last month
    const lastMonth = new Date(now);
    lastMonth.setMonth(now.getMonth() - 1);

    const clientsLastMonth = await prisma.user.count({
      where: {
        role: UserRole.CLIENT,
        isArchived: false, // Only count active clients, exclude archived
        createdAt: {
          gte: lastMonth,
          lt: now,
        },
      },
    });

    // Calculate clients for the month before last
    const monthBeforeLast = new Date(now);
    monthBeforeLast.setMonth(now.getMonth() - 2);

    const clientsMonthBeforeLast = await prisma.user.count({
      where: {
        role: UserRole.CLIENT,
        isArchived: false, // Only count active clients, exclude archived
        createdAt: {
          gte: monthBeforeLast,
          lt: lastMonth,
        },
      },
    });

    if (clientsMonthBeforeLast === 0) {
      return { success: true, data: clientsLastMonth > 0 ? 100 : 0 }; // Avoid division by zero
    }

    const growthRate =
      ((clientsLastMonth - clientsMonthBeforeLast) / clientsMonthBeforeLast) *
      100;

    return { success: true, data: parseFloat(growthRate.toFixed(2)) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getNewClientsChangePercentage() {
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

    const last30DaysCount = await prisma.user.count({
      where: {
        role: UserRole.CLIENT,
        isArchived: false, // Only count active clients, exclude archived
        createdAt: {
          gte: last30Days,
          lt: now,
        },
      },
    });

    const previous30DaysCount = await prisma.user.count({
      where: {
        role: UserRole.CLIENT,
        isArchived: false, // Only count active clients, exclude archived
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
