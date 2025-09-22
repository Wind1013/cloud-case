"use server";

import { getAuthSession } from "@/data/auth";
import prisma from "@/lib/prisma";
import { Document } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { config } from "@/config";

type CreateDocument = Omit<Document, "id" | "createdAt" | "updatedAt">;

export async function createDocument(docData: CreateDocument) {
  await getAuthSession();
  try {
    const { caseId, name, type, size, url } = docData;

    const storageUrl = `https://${config.S3_BUCKET_NAME}.t3.storage.dev/${url}`;

    const newDoc = await prisma.document.create({
      data: {
        name,
        url: storageUrl,
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
