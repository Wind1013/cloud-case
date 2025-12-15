"use server";

// MySQL compatibility: removed mode: "insensitive" from Prisma queries
import { Prisma } from "@/generated/prisma";
import { getAuthSession } from "@/data/auth";
import { lexicalToHtml } from "@/lib/lexical-server";
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
  await getAuthSession();

  const where: Prisma.TemplateWhereInput = query
    ? {
        status: "ACTIVE",
        name: {
          contains: query,
        },
      }
    : {
        status: "ACTIVE",
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
  await getAuthSession();

  const where: Prisma.TemplateWhereInput = query
    ? {
        status: "ARCHIVED",
        name: {
          contains: query,
        },
      }
    : {
        status: "ARCHIVED",
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
  await getAuthSession();
  const template = await prisma.template.findUnique({
    where: { id },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  return template;
}

// Create template
export async function createTemplate(data: {
  name: string;
  content: string;
  marginTop?: number;
  marginRight?: number;
  marginBottom?: number;
  marginLeft?: number;
}) {
  try {
    // Check authentication
    await getAuthSession();

    const {
      name,
      content,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
    } = data;

    if (!name || !name.trim()) {
      return { error: "Template name is required" };
    }

    if (!content || !content.trim()) {
      return { error: "Template content is required" };
    }

    let variables: string[] = [];
    
    // Extract variables directly from content (works for both JSON and HTML)
    try {
      // Parse JSON to check if it's valid Lexical editor state
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        // Extract variables from the JSON string directly (faster, no jsdom needed)
        variables = extractVariables(content);
        
        // Try to convert to HTML for variable extraction (optional, can fail)
        try {
          await lexicalToHtml(content);
        } catch (lexicalError) {
          // If conversion fails, that's okay - we already extracted variables
          console.warn("Lexical to HTML conversion failed (non-critical):", lexicalError);
        }
      } else {
        // If not valid JSON, treat as plain HTML
        variables = extractVariables(content);
      }
    } catch (parseError) {
      // If JSON parsing fails, treat as plain HTML
      variables = extractVariables(content);
    }

    // Create template in database
    const template = await prisma.template.create({
      data: {
        name: name.trim(),
        content,
        variables,
        marginTop: marginTop ?? null,
        marginRight: marginRight ?? null,
        marginBottom: marginBottom ?? null,
        marginLeft: marginLeft ?? null,
      },
    });

    revalidatePath("/legal-forms");
    return { success: true, data: template };
  } catch (error) {
    console.error("Error creating template:", error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Failed to create template. Please try again.";
    return { error: errorMessage };
  }
}

// Update template
export async function updateTemplate(
  id: string,
  data: {
    name: string;
    content: string;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
  }
) {
  try {
    await getAuthSession();
  } catch (error) {
    return { error: "Authentication required. Please sign in." };
  }

  try {
    const existing = await prisma.template.findUnique({
      where: { id },
    });

    if (!existing) {
      return { error: "Template not found" };
    }

    const {
      name,
      content,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
    } = data;

    if (!name || !name.trim()) {
      return { error: "Template name is required" };
    }

    if (!content) {
      return { error: "Template content is required" };
    }

    let variables: string[] = [];
    
    // Extract variables directly from content (works for both JSON and HTML)
    try {
      // Parse JSON to check if it's valid Lexical editor state
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === 'object') {
        // Extract variables from the JSON string directly (faster, no jsdom needed)
        variables = extractVariables(content);
        
        // Try to convert to HTML for variable extraction (optional, can fail)
        try {
          await lexicalToHtml(content);
        } catch (lexicalError) {
          // If conversion fails, that's okay - we already extracted variables
          console.warn("Lexical to HTML conversion failed (non-critical):", lexicalError);
        }
      } else {
        // If not valid JSON, treat as plain HTML
        variables = extractVariables(content);
      }
    } catch (parseError) {
      // If JSON parsing fails, treat as plain HTML
      variables = extractVariables(content);
    }

    const updated = await prisma.template.update({
      where: { id },
      data: {
        name,
        content,
        variables,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft,
      },
    });

    revalidatePath("/legal-forms");
    revalidatePath(`/legal-forms/${id}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating template:", error);
    return { 
      error: error instanceof Error ? error.message : "Failed to update template" 
    };
  }
}

// Delete template
export async function deleteTemplate(id: string) {
  await getAuthSession();
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
  await getAuthSession();
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

// Unarchive template
export async function unarchiveTemplate(id: string) {
  await getAuthSession();
  const existing = await prisma.template.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("Form not found");
  }

  await prisma.template.update({
    where: { id },
    data: { status: "ACTIVE" },
  });

  revalidatePath("/legal-forms");
  return { success: true };
}
