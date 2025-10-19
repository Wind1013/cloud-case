"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUser } from "@/actions/users";
import { useModal } from "@/providers/modal-context";

const addClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email address"),
  phone: z.string().optional(),
});

type AddClientValues = z.infer<typeof addClientSchema>;

export function AddClientModal() {
  const { setClose } = useModal();
  const form = useForm<AddClientValues>({
    resolver: zodResolver(addClientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (values: AddClientValues) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    if (values.phone) {
      formData.append("phone", values.phone);
    }

    const result = await createUser(formData);

    if (result.success) {
      toast.success(result.success);
      form.reset();
      setClose("add-client");
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Client</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new client.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...form.register("phone")} />
          </div>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Adding..." : "Add Client"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
