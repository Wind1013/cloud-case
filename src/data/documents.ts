import "server-only";
import { getAuthSession } from "./auth";
import prisma from "@/lib/prisma";
import { Prisma, Document } from "@/generated/prisma";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "@/config";
import { client } from "@/lib/tigris-client";

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
          AND: [{ name: { contains: query, mode: "insensitive" } }],
        }
      : {};

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
      documents.map(async (doc) => {
        const command = new GetObjectCommand({
          Bucket: config.S3_BUCKET_NAME,
          Key: doc.url,
        });

        const signedUrl = await getSignedUrl(client, command, {
          expiresIn: 3600, // 1 hour
        });

        return {
          ...doc,
          signedUrl,
        };
      })
    );

    const total = await prisma.document.count({ where });

    return { success: true, data: documentsWithSignedUrls, total };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
