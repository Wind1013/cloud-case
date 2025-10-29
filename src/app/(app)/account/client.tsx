"use client";

import { updateAccount } from "@/actions/users";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { sendVerificationEmail } from "@/lib/auth-client";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { User } from "@/generated/prisma";

const accountFormSchema = z.object({
  name: z.string().min(2, {
    message: "Display Name must be at least 2 characters.",
  }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  email: z.email(),
  gender: z.enum(["MALE", "FEMALE"]),
  birthday: z.string().optional(),
  phone: z.string().optional(),
  image: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export function AccountClient({ user }: { user: User }) {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pt-10">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">
          👤 Account Settings
        </h3>
        <p className="text-sm text-muted-foreground">
          Update your profile information and personal details.
        </p>
      </div>

      <EmailSection email={user.email} isVerified={user.emailVerified} />

      <Separator />

      <ProfileForm user={user} />
    </div>
  );
}

function EmailSection({
  email,
  isVerified,
}: {
  email: string;
  isVerified: boolean;
}) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleVerifyEmail = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Sending verification email...");
    try {
      await sendVerificationEmail({ email });
      toast.success("Verification email sent.", { id: toastId });
    } catch (error) {
      toast.error("Failed to send verification email.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex flex-col space-y-1">
        <p className="font-semibold text-gray-800 dark:text-gray-200">
          {email}
        </p>
        {isVerified ? (
          <Badge className="w-fit">Verified</Badge>
        ) : (
          <Badge className="w-fit" variant="secondary">
            Unverified
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        {!isVerified && (
          <Button onClick={handleVerifyEmail} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify Email
          </Button>
        )}
        <Link
          href="/account/change-email"
          className={buttonVariants({ variant: "outline" })}
        >
          Change Email
        </Link>
        <Link
          href="/account/change-password"
          className={buttonVariants({ variant: "outline" })}
        >
          Change Password
        </Link>
      </div>
    </div>
  );
}

function ProfileForm({ user }: { user: User }) {
  const form = useForm<AccountFormValues>({
    mode: "all",
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: user.name || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      middleName: user.middleName || "",
      gender: user.gender as "MALE" | "FEMALE",
      birthday: user.birthday
        ? new Date(user.birthday).toISOString().split("T")[0]
        : "",
      phone: user.phone || "",
      image: user.image || "",
      email: user.email, // This is needed by the schema
    },
  });

  async function onSubmit(data: AccountFormValues) {
    const toastId = toast.loading("Updating account...");
    try {
      await updateAccount(user.id, data);
      form.reset(data); // Reset form state to new values
      toast.success("Account updated successfully.", { id: toastId });
    } catch (error) {
      toast.error("Failed to update account. Please try again.", {
        id: toastId,
      });
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Display Name</h4>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your preferred display name"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This name appears on your public profile and in emails.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Legal Name</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First Name" {...field} />
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
                      <Input placeholder="Last Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="middleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle Name (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Middle Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="text-lg font-medium">Personal Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select your gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
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
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="(555) 555-5555"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Button type="submit">Update account</Button>
        </form>
      </Form>
    </>
  );
}
