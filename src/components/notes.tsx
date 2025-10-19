"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createNote, deleteNote, updateNote } from "@/actions/notes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Note } from "@/generated/prisma";
import { useRouter } from "next/navigation";

interface NotesProps {
  notes: Note[];
  clientId: string;
}

const noteSchema = z.object({
  content: z.string().min(1, "Content is required"),
});

type NoteValues = z.infer<typeof noteSchema>;

export function Notes({ notes, clientId }: NotesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<NoteValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      content: "",
    },
  });

  const editForm = useForm<NoteValues>({
    resolver: zodResolver(noteSchema),
  });

  const onSubmit = async (values: NoteValues) => {
    const formData = new FormData();
    formData.append("content", values.content);
    formData.append("userId", clientId);

    const result = await createNote(formData);

    if (result.success) {
      toast.success(result.success);
      form.reset();
      setIsAdding(false);
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  const onUpdate = async (values: NoteValues) => {
    if (!editingNoteId) return;

    const formData = new FormData();
    formData.append("content", values.content);
    formData.append("noteId", editingNoteId);

    const result = await updateNote(formData);

    if (result.success) {
      toast.success(result.success);
      router.refresh();
      setEditingNoteId(null);
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  const handleDelete = async (noteId: string) => {
    const formData = new FormData();
    formData.append("noteId", noteId);

    const result = await deleteNote(formData);

    if (result.success) {
      toast.success(result.success);
      router.refresh();
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Notes</h2>
        <Button onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancel" : "Add Note"}
        </Button>
      </div>

      {isAdding && (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-4">
          <Textarea
            {...form.register("content")}
            placeholder="Add a new note..."
          />
          {form.formState.errors.content && (
            <p className="text-red-500 text-sm">
              {form.formState.errors.content.message}
            </p>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Adding..." : "Add Note"}
          </Button>
        </form>
      )}

      <div className="space-y-4">
        {notes.map(note => (
          <div key={note.id} className="p-4 border rounded-md">
            {editingNoteId === note.id ? (
              <form
                onSubmit={editForm.handleSubmit(onUpdate)}
                className="space-y-4"
              >
                <Textarea
                  {...editForm.register("content")}
                  defaultValue={note.content}
                />
                {editForm.formState.errors.content && (
                  <p className="text-red-500 text-sm">
                    {editForm.formState.errors.content.message}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingNoteId(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={editForm.formState.isSubmitting}
                  >
                    {editForm.formState.isSubmitting ? "Updating..." : "Update"}
                  </Button>
                </div>
              </form>
            ) : (
              <div>
                <p>{note.content}</p>
                <div className="flex justify-end gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingNoteId(note.id)}
                  >
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the note.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(note.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
