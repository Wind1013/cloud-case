import "server-only";
import prisma from "@/lib/prisma";
import { getAuthSession } from "./auth";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { config } from "@/config";
import { client } from "@/lib/tigris-client";
import { CaseStatus, CaseType, Prisma } from "@/generated/prisma";

// export async function getCases(
//   filters: { query?: string; types?: string[]; statuses?: string[] } = {}
// ) {
//   await getAuthSession();
//   const { query, types, statuses } = filters;

//   try {
//     const cases = await prisma.case.findMany({
//       where: {
//         AND: [
//           query
//             ? {
//                 OR: [
//                   {
//                     title: {
//                       contains: query,
//                       mode: "insensitive",
//                     },
//                   },
//                   {
//                     description: {
//                       contains: query,
//                       mode: "insensitive",
//                     },
//                   },
//                   {
//                     client: {
//                       name: {
//                         contains: query,
//                         mode: Prisma.QueryMode.insensitive,
//                       },
//                     },
//                   },
//                 ],
//               }
//             : {},
//           types && types.length > 0 ? { type: { in: types } } : {},
//           statuses && statuses.length > 0 ? { status: { in: statuses } } : {},
//         ].filter(condition => Object.keys(condition).length > 0),
//       },
//       include: {
//         client: true,
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return { success: true, data: cases };
//   } catch (error) {
//     return { success: false, error: (error as Error).message };
//   }
// }

export async function getCases(
  filters: { query?: string; types?: string[]; statuses?: string[] } = {}
) {
  await getAuthSession();
  const { query, types, statuses } = filters;

  try {
    const whereConditions: Prisma.CaseWhereInput[] = [];

    if (query) {
      whereConditions.push({
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            client: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
        ],
      });
    }

    if (types && types.length > 0) {
      whereConditions.push({ type: { in: types as CaseType[] } });
    }

    if (statuses && statuses.length > 0) {
      whereConditions.push({ status: { in: statuses as CaseStatus[] } });
    }

    const cases = await prisma.case.findMany({
      where: whereConditions.length > 0 ? { AND: whereConditions } : {},
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
