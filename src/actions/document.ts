"use server";

import { getAuthSession } from "@/data/auth";
import prisma from "@/lib/prisma";
import { Document } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { config } from "@/config";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { client } from "@/lib/tigris-client";

type CreateDocument = Omit<Document, "id" | "createdAt" | "updatedAt" | "isArchived">;

export async function createDocument(docData: CreateDocument) {
  await getAuthSession();
  try {
    const { caseId, name, type, size, url } = docData;

    const newDoc = await prisma.document.create({
      data: {
        name,
        url,
        size,
        type,
        caseId,
      },
    });

    revalidatePath("/cases");
    return { success: true, data: newDoc };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function archiveDocument(documentId: string) {
  await getAuthSession();

  try {
    await prisma.document.update({
      where: { id: documentId },
      data: { isArchived: true },
    });

    return { success: true };
  } catch (error) {
    console.error("Error archiving document:", error);
    return { success: false, error: (error as Error).message };
  }
}
