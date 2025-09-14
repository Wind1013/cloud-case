"use server";

import { Case } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthSession } from "./session";

export type CreateCase = Pick<
  Case,
  "title" | "description" | "clientId" | "lawyerId"
>;
export async function createCase(formData: CreateCase) {
  try {
    const { title, description, clientId, lawyerId } = formData;

    const newCase = await prisma.case.create({
      data: {
        title,
        description,
        status: "PENDING",
        clientId,
        lawyerId,
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

export async function getCases() {
  const session = await getAuthSession();

  try {
    const cases = await prisma.case.findMany({
      where: {},
      include: {
        client: true,
        lawyer: true,
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
  try {
    const caseData = await prisma.case.findUnique({
      where: {
        id: id,
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
