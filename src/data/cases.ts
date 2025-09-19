import "server-only";
import prisma from "@/lib/prisma";
import { getAuthSession } from "./auth";

export async function getCases() {
  await getAuthSession();

  try {
    const cases = await prisma.case.findMany({
      where: {},
      include: {
        client: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: cases };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getCaseById(id: string) {
  await getAuthSession();
  try {
    const caseData = await prisma.case.findUnique({
      where: {
        id: id,
      },
      include: {
        client: true,
      },
    });
    if (!caseData) {
      return { success: false, error: "Case not found" };
    }
    return { success: true, data: caseData };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
