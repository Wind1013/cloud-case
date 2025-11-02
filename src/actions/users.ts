"use server";

import { Gender, UserRole } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export interface GetUsersParams {
  role?: UserRole;
}

const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  birthday: z.string().optional(),
  image: z.string().optional(),
});

export async function createUser(formData: FormData) {
  const validatedFields = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    middleName: formData.get("middleName"),
    gender: formData.get("gender"),
    birthday: formData.get("birthday"),
    image: formData.get("image"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
    };
  }

  const {
    name,
    email,
    phone,
    firstName,
    lastName,
    middleName,
    gender,
    birthday,
    image,
  } = validatedFields.data;

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        phone,
        firstName,
        lastName,
        middleName,
        gender,
        birthday: birthday ? new Date(birthday) : undefined,
        image,
        role: UserRole.CLIENT,
      },
    });
    return {
      success: "Client created successfully",
    };
  } catch (error) {
    return {
      error: "Failed to create client",
    };
  }
}

export async function updateUser(id: string, formData: FormData) {
  const validatedFields = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    middleName: formData.get("middleName"),
    gender: formData.get("gender"),
    birthday: formData.get("birthday"),
    image: formData.get("image"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
    };
  }

  const {
    name,
    email,
    phone,
    firstName,
    lastName,
    middleName,
    gender,
    birthday,
    image,
  } = validatedFields.data;

  try {
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        name,
        email,
        phone,
        firstName,
        lastName,
        middleName,
        gender,
        birthday: birthday ? new Date(birthday) : undefined,
        image,
      },
    });
    return {
      success: "Client updated successfully",
    };
  } catch (error) {
    return {
      error: "Failed to update client",
    };
  }
}

export async function updateAccount(
  id: string,
  data: {
    name: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    gender: "MALE" | "FEMALE";
    birthday?: string;
    phone?: string;
    image?: string;
  }
) {
  try {
    await prisma.user.update({
      where: { id },
      data: {
        ...data,
        birthday: data.birthday ? new Date(data.birthday) : undefined,
      },
    });

    revalidatePath("/account");
    return {
      success: "Account updated successfully",
    };
  } catch (error) {
    return {
      error: "Failed to update account",
    };
  }
}

export async function getNewClientsCount() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const count = await prisma.user.count({
      where: {
        role: UserRole.CLIENT,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });
    return { success: true, data: count };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
