import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const emailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid email address"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = emailSchema.parse({
      email: (body.email as string | undefined)?.trim().toLowerCase(),
    });

    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
      select: { id: true },
    });

    return NextResponse.json({ exists: Boolean(user) });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid email address" },
        { status: 400 }
      );
    }

    console.error("Error checking email existence:", error);
    return NextResponse.json(
      { error: "Unable to validate email at this time" },
      { status: 500 }
    );
  }
}

