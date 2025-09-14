"use server";

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
