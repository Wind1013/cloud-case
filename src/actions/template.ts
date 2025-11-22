"use server";

import { Prisma } from "@/generated/prisma";
import { getServerSession } from "@/lib/get-session";
import { lexicalToHtml } from "@/lib/lexical";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function extractVariables(content: string): string[] {
  const matches = content.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return [];
  return [...new Set(matches.map(m => m.replace(/[{}]/g, "").trim()))];
}

// Get all templates
export async function getTemplates({
  page = 1,
  limit = 10,
  query = "",
}: {
  page?: number;
  limit?: number;
  query?: string;
}) {
  await getServerSession();

  const where: Prisma.TemplateWhereInput = {
    status: "ACTIVE",
    ...(query && { name: { contains: query, mode: "insensitive" } }),
  };

  const [templates, total] = await Promise.all([
    prisma.template.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.template.count({ where }),
  ]);

  return { data: templates, total };
}

// Get all archived templates
export async function getArchivedTemplates({
  page = 1,
  limit = 10,
  query = "",
}: {
  page?: number;
  limit?: number;
  query?: string;
}) {
  await getServerSession();

  const where: Prisma.TemplateWhereInput = {
    status: "ARCHIVED",
    ...(query && { name: { contains: query, mode: "insensitive" } }),
  };

  const [templates, total] = await Promise.all([
    prisma.template.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.template.count({ where }),
  ]);

  return { data: templates, total };
}

// Get single template
export async function getTemplate(id: string) {
  await getServerSession();
  const template = await prisma.template.findUnique({
    where: { id },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  return template;
}

// Create template
export async function createTemplate(data: { name: string; content: string }) {
  await getServerSession();

  const { name, content } = data;

  if (!name || !content) {
    throw new Error("Name and content are required");
  }

  const html = lexicalToHtml(content);
  const variables = extractVariables(html);

  const template = await prisma.template.create({
    data: {
      name,
      content,
      variables,
    },
  });

  revalidatePath("/legal-forms");
  return template;
}

// Update template
export async function updateTemplate(
  id: string,
  data: { name: string; content: string }
) {
  await getServerSession();
  const existing = await prisma.template.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Template not found");
  }

  const { name, content } = data;
  const html = lexicalToHtml(content);
  const variables = extractVariables(html);

  const updated = await prisma.template.update({
    where: { id },
    data: { name, content, variables },
  });

  revalidatePath("/legal-forms");
  revalidatePath(`/legal-forms/${id}`);
  return updated;
}

// Delete template
export async function deleteTemplate(id: string) {
  await getServerSession();
  const existing = await prisma.template.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Template not found");
  }

  await prisma.template.delete({
    where: { id },
  });

  revalidatePath("/legal-forms");
  return { success: true };
}

// Archive template
export async function archiveTemplate(id: string) {
  await getServerSession();
  const existing = await prisma.template.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Form not found");
  }

  await prisma.template.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  revalidatePath("/legal-forms");
  return { success: true };
}
