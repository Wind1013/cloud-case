"use server";

import { UserRole } from "@/generated/prisma";
import prisma from "@/lib/prisma";

export interface GetUsersParams {
  role?: UserRole;
}
