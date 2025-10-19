import "server-only";
import { UserRole } from "@/generated/prisma";
import prisma from "@/lib/prisma";

export interface GetUsersParams {
  role?: UserRole;
}

export const getUsers = async ({ role }: GetUsersParams = {}) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        ...(role ? { role: role } : {}),
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
        role: true,
        createdAt: true,
        emailVerified: true,
        image: true,
        updatedAt: true,
      },
    });

    return users;
  } catch (error) {
    console.error("[GET_USERS_ERROR]", error);
    throw new Error("Failed to fetch users");
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
