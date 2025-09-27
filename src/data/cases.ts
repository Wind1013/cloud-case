import "server-only";
import prisma from "@/lib/prisma";
import { getAuthSession } from "./auth";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "@/config";
import { client } from "@/lib/tigris-client";

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
        documents: true,
      },
    });

    if (!caseData) {
      return { success: false, error: "Case not found" };
    }

    const documentsWithSignedUrls = await Promise.all(
      caseData.documents.map(async doc => {
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

    return {
      success: true,
      data: { ...caseData, documents: documentsWithSignedUrls },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
