import "server-only";
import { UserRole } from "@/generated/prisma";
import prisma from "@/lib/prisma";

export interface GetUsersParams {
  role?: UserRole;
  query?: string;
}

export const getUsers = async ({ role, query }: GetUsersParams) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        isArchived: false,
        ...(role ? { role: role } : {}),
        ...(query
          ? {
              OR: [
                {
                  firstName: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  lastName: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        middleName: true,
        gender: true,
        birthday: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
        emailVerified: true,
        image: true,
        updatedAt: true,
        isArchived: true,
      },
    });

    return users;
  } catch (error) {
    console.error("[GET_USERS_ERROR]", error);
    throw new Error("Failed to fetch users");
  }
};

export const getArchivedUsers = async ({ role, query }: GetUsersParams) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        isArchived: true,
        ...(role ? { role: role } : {}),
        ...(query
          ? {
              OR: [
                {
                  firstName: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  lastName: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
                {
                  email: {
                    contains: query,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        middleName: true,
        gender: true,
        birthday: true,
        phone: true,
        address: true,
        role: true,
        createdAt: true,
        emailVerified: true,
        image: true,
        updatedAt: true,
        isArchived: true,
      },
    });

    return users;
  } catch (error) {
    console.error("[GET_ARCHIVED_USERS_ERROR]", error);
    throw new Error("Failed to fetch archived users");
  }
};

export const getUserById = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        clientCases: true,
        notes: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
    return user;
  } catch (error) {
    console.error("[GET_USER_BY_ID_ERROR]", error);
    throw new Error("Failed to fetch user");
  }
};
