"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createNoteSchema = z.object({
  content: z.string().min(1, "Content is required"),
  userId: z.string(),
});

export async function createNote(formData: FormData) {
  const validatedFields = createNoteSchema.safeParse({
    content: formData.get("content"),
    userId: formData.get("userId"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
    };
  }

  const { content, userId } = validatedFields.data;

  try {
    await prisma.note.create({
      data: {
        content,
        userId,
      },
    });
    revalidatePath(`/clients/${userId}`);
    return {
      success: "Note created successfully",
    };
  } catch (error) {
    return {
      error: "Failed to create note",
    };
  }
}

const updateNoteSchema = z.object({
  noteId: z.string(),
  content: z.string().min(1, "Content is required"),
});

export async function updateNote(formData: FormData) {
  const validatedFields = updateNoteSchema.safeParse({
    noteId: formData.get("noteId"),
    content: formData.get("content"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
    };
  }

  const { noteId, content } = validatedFields.data;

  try {
    await prisma.note.update({
      where: { id: noteId },
      data: {
        content,
      },
    });
    return {
      success: "Note updated successfully",
    };
  } catch (error) {
    return {
      error: "Failed to update note",
    };
  }
}

const deleteNoteSchema = z.object({
  noteId: z.string(),
});

export async function deleteNote(formData: FormData) {
  const validatedFields = deleteNoteSchema.safeParse({
    noteId: formData.get("noteId"),
  });

  if (!validatedFields.success) {
    return {
      error: "Invalid fields",
    };
  }

  const { noteId } = validatedFields.data;

  try {
    await prisma.note.delete({
      where: { id: noteId },
    });
    return {
      success: "Note deleted successfully",
    };
  } catch (error) {
    return {
      error: "Failed to delete note",
    };
  }
}
