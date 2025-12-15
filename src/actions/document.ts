"use server";

import { getAuthSession } from "@/data/auth";
import prisma from "@/lib/prisma";
import { Document } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { config } from "@/config";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/lib/s3-client";

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

    revalidatePath("/documents");
    return { success: true };
  } catch (error) {
    console.error("Error archiving document:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function unarchiveDocument(documentId: string) {
  await getAuthSession();

  try {
    await prisma.document.update({
      where: { id: documentId },
      data: { isArchived: false },
    });

    revalidatePath("/documents");
    return { success: true };
  } catch (error) {
    console.error("Error unarchiving document:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteDocument(documentId: string) {
  await getAuthSession();

  try {
    // Get the document to get the S3 key
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return { success: false, error: "Document not found" };
    }

    // Delete from S3
    try {
      const command = new DeleteObjectCommand({
        Bucket: config.S3_BUCKET_NAME,
        Key: document.url,
      });

      await s3Client.send(command);
    } catch (s3Error) {
      console.error("Error deleting file from S3:", s3Error);
      // Continue with database deletion even if S3 deletion fails
    }

    // Delete from database
    await prisma.document.delete({
      where: { id: documentId },
    });

    revalidatePath("/cases");
    revalidatePath("/documents");
    return { success: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteAllCaseDocuments(caseId: string) {
  await getAuthSession();

  try {
    // Get all documents for the case
    const documents = await prisma.document.findMany({
      where: { caseId },
    });

    // Delete all files from S3
    const deletePromises = documents.map(async (document) => {
      try {
        const command = new DeleteObjectCommand({
          Bucket: config.S3_BUCKET_NAME,
          Key: document.url,
        });
        await s3Client.send(command);
      } catch (s3Error) {
        console.error(`Error deleting file ${document.url} from S3:`, s3Error);
        // Continue even if S3 deletion fails
      }
    });

    await Promise.all(deletePromises);

    // Delete all documents from database
    await prisma.document.deleteMany({
      where: { caseId },
    });

    revalidatePath("/cases");
    revalidatePath("/documents");
    return { success: true };
  } catch (error) {
    console.error("Error deleting case documents:", error);
    return { success: false, error: (error as Error).message };
  }
}
