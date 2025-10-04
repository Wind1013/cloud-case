import "server-only";
import { getAuthSession } from "./auth";
import prisma from "@/lib/prisma";
import { Prisma, Document } from "@/generated/prisma";

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

    const total = await prisma.document.count({ where });

    return { success: true, data: documents, total };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
