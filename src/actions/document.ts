"use server";

import { getAuthSession } from "@/data/auth";
import prisma from "@/lib/prisma";
import { Document } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { config } from "@/config";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { client } from "@/lib/tigris-client";

type CreateDocument = Omit<Document, "id" | "createdAt" | "updatedAt">;

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

export async function deleteDocument(documentId: string) {
  await getAuthSession();

  try {
    // Get the document first
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return { success: false, error: "Document not found" };
    }

    // Skip deletion for fake example URLs
    if (!document.url.startsWith("https://storage.example.com/")) {
      // Clean up the object key (same logic as before)
      let objectKey = document.url;
      if (objectKey.startsWith("https://")) {
        const parts = objectKey.split("/");
        const keyIndex = parts.findIndex(part => part === "cloud.case");
        if (keyIndex !== -1 && keyIndex < parts.length - 1) {
          objectKey = parts.slice(keyIndex + 1).join("/");
        }
      }

      // Delete from Tigris
      const deleteCommand = new DeleteObjectCommand({
        Bucket: config.S3_BUCKET_NAME,
        Key: objectKey,
      });

      await client.send(deleteCommand);
    }

    // Delete from database
    await prisma.document.delete({
      where: { id: documentId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    return { success: false, error: (error as Error).message };
  }
}
