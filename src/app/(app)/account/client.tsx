"use client";
// Zod fix: use issues instead of errors for ZodError
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
import { sendVerificationEmail, changeEmail } from "@/lib/auth-client";
import { isValidPhoneNumberSync } from "@/lib/phone-validation";
import React, { useRef, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { User } from "@/generated/prisma";
import { PhoneInputSimple as PhoneInput } from "@/components/ui/phone-input-simple";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle } from "lucide-react";

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
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || isValidPhoneNumberSync(val, "PH"),
      {
        message: "Please enter a valid Philippine phone number (e.g., 09123456789 or +63 912 345 6789)",
      }
    ),
  image: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

export function AccountClient({ user }: { user: User }) {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pt-10 px-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <UserIcon className="h-6 w-6 text-primary" />
          <h3 className="text-2xl font-bold tracking-tight">
            Account Settings
          </h3>
        </div>
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
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [showChangeEmailForm, setShowChangeEmailForm] = useState(false);

  const emailSchema = z.object({
    newEmail: z
      .email("Please enter a valid email address")
      .min(1, "Email is required"),
  });

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

  const handleChangeEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(null);
    setValidationError("");
    setIsChangingEmail(true);

    try {
      const validation = emailSchema.safeParse({ newEmail });

      if (!validation.success) {
        const error = validation.error.issues[0]?.message || "Invalid email";
        setValidationError(error);
        setIsChangingEmail(false);
        return;
      }

      await changeEmail({
        newEmail: validation.data.newEmail,
        callbackURL: "/account",
      });

      setMessage(
        `A verification email has been sent to your ${
          isVerified ? "old" : "new"
        } email address. Please verify the change.`
      );
      setIsSuccess(true);
      setNewEmail("");
    } catch (error) {
      setMessage("Failed to change email. Please try again.");
      setIsSuccess(false);
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmail(e.target.value);
    if (validationError) {
      setValidationError("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex flex-col space-y-2">
            <p className="font-bold text-lg">{email}</p>
            {isVerified ? (
              <Badge className="w-fit bg-green-100 text-green-800 hover:bg-green-100">
                Verified
              </Badge>
            ) : (
              <Badge className="w-fit" variant="secondary">
                Unverified
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            {!isVerified && (
              <Button onClick={handleVerifyEmail} disabled={isLoading} variant="default">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Email
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowChangeEmailForm(!showChangeEmailForm)}
            >
              Change Email
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/account/change-password")}
            >
              Change Password
            </Button>
          </div>
        </div>

        {showChangeEmailForm && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/50">
            <form onSubmit={handleChangeEmail} className="space-y-3">
              <div className="space-y-2">
                <label htmlFor="new-email" className="text-sm font-medium">
                  New Email
                </label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="Enter your new email"
                  value={newEmail}
                  onChange={handleEmailChange}
                  required
                  disabled={isChangingEmail}
                  className={validationError ? "border-red-500" : ""}
                />
                {validationError && (
                  <p className="text-sm text-red-500 mt-1">{validationError}</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isChangingEmail} size="sm">
                  {isChangingEmail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Changing Email...
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowChangeEmailForm(false);
                    setNewEmail("");
                    setValidationError("");
                    setMessage("");
                  }}
                >
                  Cancel
                </Button>
              </div>

              {message && (
                <Alert variant={isSuccess ? "default" : "destructive"}>
                  {isSuccess ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertTitle>{isSuccess ? "Success" : "Error"}</AlertTitle>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileForm({ user }: { user: User }) {
  const lastValidPhoneRef = useRef<string>(user.phone || "");

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

  const phone = form.watch("phone");

  // Update ref when phone value changes (from form)
  useEffect(() => {
    if (phone) {
      lastValidPhoneRef.current = phone;
    }
  }, [phone]);

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
                render={({ field }) => {
                  // Calculate max digits based on current or incoming value
                  const getMaxDigits = (val: string): number => {
                    if (!val) return 12; // Default for international
                    const digits = val.replace(/\D/g, "");
                    
                    if (digits.startsWith("09")) return 11; // Local mobile: 09XX XXX XXXX
                    if (digits.startsWith("639") || (digits.startsWith("63") && digits.length >= 3 && digits[2] === "9")) return 12; // International mobile: +63 9XX XXX XXXX (12 digits total)
                    if (digits.startsWith("0") && /^0[2-8]/.test(digits)) return 10; // Local landline: 0X XXX XXXX
                    if (digits.startsWith("63") && /^63[2-8]/.test(digits)) return 12; // International landline: +63 X XXX XXXX (12 digits total)
                    if (val.startsWith("+63")) return 12; // Default for +63 (12 digits total)
                    return 12; // Default
                  };

                  const handlePhoneChange = (value: string) => {
                    if (!value) {
                      lastValidPhoneRef.current = "";
                      field.onChange("");
                      return;
                    }

                    // Extract only digits to check length
                    const digits = value.replace(/\D/g, "");
                    
                    // Determine max digits based on the incoming value
                    const maxDigits = getMaxDigits(value);

                    // If digits exceed the limit, don't update
                    if (digits.length > maxDigits) {
                      // Don't update - keep the previous value
                      // Force the input to use the last valid value
                      setTimeout(() => {
                        field.onChange(lastValidPhoneRef.current);
                      }, 0);
                      return;
                    }

                    // Update the last valid value and allow the change
                    lastValidPhoneRef.current = value;
                    field.onChange(value);
                  };

                  // Calculate maxLength based on current value
                  const currentMaxLength = getMaxDigits(field.value || "");

                  return (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <PhoneInput
                          value={field.value}
                          onChange={handlePhoneChange}
                          defaultCountry="PH"
                          international
                          maxLength={currentMaxLength}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter a valid Philippine phone number (e.g., 09123456789 or +63 912 345 6789)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
          </div>

          <Button type="submit">Update account</Button>
        </form>
      </Form>
    </>
  );
}
