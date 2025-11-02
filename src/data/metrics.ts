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
