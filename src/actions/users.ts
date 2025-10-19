"use server";

import { UserRole } from "@/generated/prisma";
import prisma from "@/lib/prisma";
import { z } from "zod";

export interface GetUsersParams {
  role?: UserRole;
}

const createUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
});

export async function createUser(formData: FormData) {
  const validatedFields = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
    };
  }

  const { name, email, phone } = validatedFields.data;

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        phone,
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
