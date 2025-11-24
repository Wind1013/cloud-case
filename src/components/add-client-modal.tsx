"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { createUser } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Gender } from "@/generated/prisma";
import { PhoneInput } from "@/components/ui/phone-input";

const addClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  birthday: z.date().optional(),
  email: z.email("Invalid email address"),
  phone: z
    .string()
    .refine(
      value => !value || isValidPhoneNumber(value, "PH"),
      "Please enter a valid Philippine phone number"
    )
    .optional(),
  image: z.string().optional(),
});

type AddClientValues = z.infer<typeof addClientSchema>;

export function AddClientModal() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const form = useForm<AddClientValues>({
    resolver: zodResolver(addClientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      firstName: "",
      lastName: "",
      middleName: "",
      image: "",
    },
  });

  const onSubmit = async (values: AddClientValues) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    if (values.phone) {
      formData.append("phone", values.phone);
    }
    if (values.firstName) {
      formData.append("firstName", values.firstName);
    }
    if (values.lastName) {
      formData.append("lastName", values.lastName);
    }
    if (values.middleName) {
      formData.append("middleName", values.middleName);
    }
    if (values.gender) {
      formData.append("gender", values.gender);
    }
    if (values.birthday) {
      formData.append("birthday", values.birthday.toISOString());
    }
    if (values.image) {
      formData.append("image", values.image);
    }

    const result = await createUser(formData);

    if (result.success) {
      toast.success(result.success);
      form.reset();
      setIsOpen(false);
      router.refresh();
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Add Client</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3 pb-4">
          <DialogTitle className="text-2xl font-semibold">
            Add New Client
          </DialogTitle>
          <DialogDescription className="text-base">
            Fill in the details below to add a new client to your system.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Basic Information
              </h3>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Display Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter display name"
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="First name"
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="middleName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Middle name"
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Last name"
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4 pt-2 border-t">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Contact Information
              </h3>
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@example.com"
                          className="h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <PhoneInput
                          value={field.value}
                          onChange={field.onChange}
                          defaultCountry="PH"
                          international
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Personal Details Section */}
            <div className="space-y-4 pt-2 border-t">
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={Gender.MALE}>Male</SelectItem>
                          <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birthday</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full h-10 justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(field.value, "PPP")
                                : "Pick a date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-10 bg-transparent"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="flex-1 h-10"
              >
                {form.formState.isSubmitting ? "Adding..." : "Add Client"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
