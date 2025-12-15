import "server-only";
import { getAuthSession } from "./auth";
import prisma from "@/lib/prisma";
import { Prisma, Document } from "@/generated/prisma";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "@/config";
import { s3Client } from "@/lib/s3-client";

export async function getDocuments({
  page,
  limit,
  query,
}: {
  page: number;
  limit: number;
  query?: string;
}) {
  await getAuthSession();

  console.log("🔍 Search params:", { page, limit, query });

  try {
    const where: Prisma.DocumentWhereInput = query
      ? {
          AND: [
            { name: { contains: query } },
            { isArchived: false },
          ],
        }
      : { isArchived: false };

    const documents = await prisma.document.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        case: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const documentsWithSignedUrls = await Promise.all(
      documents.map(async doc => {
        try {
          const command = new GetObjectCommand({
            Bucket: config.S3_BUCKET_NAME,
            Key: doc.url,
          });

          const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600, // 1 hour
          });

          return {
            ...doc,
            signedUrl,
          };
        } catch (error: any) {
          console.error(`[DOCUMENTS] Error generating signed URL for document ${doc.id}:`, {
            error: error?.message,
            code: error?.code,
            name: error?.name,
            documentUrl: doc.url,
            bucket: config.S3_BUCKET_NAME,
            endpoint: config.AWS_ENDPOINT_URL_S3,
            hasAccessKey: !!config.AWS_ACCESS_KEY_ID,
            accessKeyLength: config.AWS_ACCESS_KEY_ID?.length || 0,
          });
          // Return document without signed URL if generation fails
          return {
            ...doc,
            signedUrl: undefined,
          };
        }
      })
    );

    const total = await prisma.document.count({ where });

    return { success: true, data: documentsWithSignedUrls, total };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function getArchivedDocuments({
  page,
  limit,
  query,
}: {
  page: number;
  limit: number;
  query?: string;
}) {
  await getAuthSession();

  console.log("🔍 Search params:", { page, limit, query });

  try {
    const where: Prisma.DocumentWhereInput = query
      ? {
          AND: [
            { name: { contains: query } },
            { isArchived: true },
          ],
        }
      : { isArchived: true };

    const documents = await prisma.document.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        case: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const documentsWithSignedUrls = await Promise.all(
      documents.map(async doc => {
        try {
          const command = new GetObjectCommand({
            Bucket: config.S3_BUCKET_NAME,
            Key: doc.url,
          });

          const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: 3600, // 1 hour
          });

          return {
            ...doc,
            signedUrl,
          };
        } catch (error: any) {
          console.error(`[DOCUMENTS] Error generating signed URL for document ${doc.id}:`, {
            error: error?.message,
            code: error?.code,
            name: error?.name,
            documentUrl: doc.url,
            bucket: config.S3_BUCKET_NAME,
            endpoint: config.AWS_ENDPOINT_URL_S3,
            hasAccessKey: !!config.AWS_ACCESS_KEY_ID,
            accessKeyLength: config.AWS_ACCESS_KEY_ID?.length || 0,
          });
          // Return document without signed URL if generation fails
          return {
            ...doc,
            signedUrl: undefined,
          };
        }
      })
    );

    const total = await prisma.document.count({ where });

    return { success: true, data: documentsWithSignedUrls, total };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
