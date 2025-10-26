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
