"use server";

import { UserRole, Gender } from "@/generated/prisma";
import prisma from "@/lib/prisma";
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

  const { name, email, phone, firstName, lastName, middleName, gender, birthday, image } = validatedFields.data;

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

  const { name, email, phone, firstName, lastName, middleName, gender, birthday, image } = validatedFields.data;

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
