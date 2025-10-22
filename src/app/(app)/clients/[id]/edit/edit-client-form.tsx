"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { User } from "@/generated/prisma";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  User as UserIcon,
  Mail,
  Phone,
  Cake,
  UserCircle,
  InfoIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUser } from "@/actions/users";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
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
import { Gender } from "@/generated/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const editClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  birthday: z.date().optional(),
  email: z.email("Invalid email address"),
  phone: z.string().optional(),
  image: z.string().optional(),
});

type EditClientValues = z.infer<typeof editClientSchema>;

export function EditClientForm({ user }: { user: User }) {
  const router = useRouter();
  const form = useForm<EditClientValues>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      name: user.name ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      middleName: user.middleName ?? "",
      gender: user.gender ?? undefined,
      birthday: user.birthday ? new Date(user.birthday) : undefined,
      image: user.image ?? "",
    },
  });

  const onSubmit = async (values: EditClientValues) => {
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

    const result = await updateUser(user.id, formData);

    if (result.success) {
      toast.success(result.success);
      router.push(`/clients/${user.id}`);
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <UserCircle className="h-6 w-6" />
            Edit Client Information
          </CardTitle>
          <CardDescription>
            Update client details and personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Display Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    className="mt-1.5"
                    placeholder="Enter display name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    {...form.register("firstName")}
                    className="mt-1.5"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    {...form.register("lastName")}
                    className="mt-1.5"
                    placeholder="Enter last name"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="middleName" className="text-sm font-medium">
                    Middle Name
                  </Label>
                  <Input
                    id="middleName"
                    {...form.register("middleName")}
                    className="mt-1.5"
                    placeholder="Enter middle name"
                  />
                </div>
              </div>
            </div>

            <div className="border-t" />

            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      className="pl-10"
                      placeholder="email@example.com"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="phone"
                      {...form.register("phone")}
                      className="pl-10"
                      placeholder="+1 (555) 000-0000"
                    />
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t" />

            {/* Personal Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <InfoIcon className="h-5 w-5" />
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full">
                  <Label className="text-sm font-medium">Gender</Label>
                  <Select
                    defaultValue={user.gender ?? undefined}
                    onValueChange={value =>
                      form.setValue("gender", value as Gender)
                    }
                  >
                    <SelectTrigger className="mt-1.5 w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Gender.MALE}>Male</SelectItem>
                      <SelectItem value={Gender.FEMALE}>Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Birthday</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1.5",
                          !form.watch("birthday") && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch("birthday") ? (
                          format(form.watch("birthday") as Date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.watch("birthday")}
                        onSelect={date => form.setValue("birthday", date)}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="border-t" />

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/clients/${user.id}`)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Updating..." : "Update Client"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
