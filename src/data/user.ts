import "server-only";
import prisma from "@/lib/prisma";
import { getAuthSession } from "./auth";

export async function getUser() {
  const session = await getAuthSession();

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    });

    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
