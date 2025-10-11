"use server";

import { Prisma } from "@/generated/prisma";
import { getServerSession } from "@/lib/get-session";
import { lexicalToHtml } from "@/lib/lexical";
import prisma from "@/lib/prisma";
import chromium from "@sparticuz/chromium";
import { revalidatePath } from "next/cache";
import puppeteer from "puppeteer-core";

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

  const where: Prisma.TemplateWhereInput = query
    ? {
        name: {
          contains: query,
          mode: "insensitive",
        },
      }
    : {};

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

  revalidatePath("/templates");
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

  revalidatePath("/templates");
  revalidatePath(`/templates/${id}`);
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

  revalidatePath("/templates");
  return { success: true };
}

export async function generatePDF(
  templateId: string,
  data: Record<string, string>
) {
  await getServerSession();
  const template = await prisma.template.findUnique({
    where: { id: templateId },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  let html = lexicalToHtml(template.content);

  // Replace variables
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    html = html.replace(regex, data[key] || "");
  });

  const isProduction = process.env.NODE_ENV === "production";

  const browser = await puppeteer.launch({
    args: isProduction
      ? chromium.args
      : ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: isProduction
      ? await chromium.executablePath()
      : process.platform === "win32"
      ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
      : process.platform === "darwin"
      ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
      : "/usr/bin/google-chrome",
    headless: true, // Just use true directly
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    });

    return {
      pdf: Buffer.from(pdf).toString("base64"),
      filename: `${template.name.replace(/[^a-z0-9]/gi, "_")}.pdf`,
    };
  } finally {
    await browser.close();
  }
}
