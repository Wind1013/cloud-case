"use client";

import type React from "react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const signUpSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    middleName: z.string().default(""),
    gender: z.string().default(""),
    birthday: z.string().optional().default(""),
    phone: z
      .string()
      .refine(
        value => isValidPhoneNumber(value, "PH"),
        "Please enter a valid Philippine phone number"
      ),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

function FormField({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      gender: "",
      birthday: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const phone = watch("phone");

  async function onSubmit(data: SignUpFormData) {
    setServerError(null);

    const userData = {
      name: `${data.firstName} ${data.lastName}`.trim(),
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName,
      gender: data.gender,
      birthday: data.birthday,
      phone: data.phone,
    };

    try {
      const res = await signUp.email({
        ...userData,
        callbackURL: "/email-verified",
      });

      if (res.error) {
        setServerError(res.error.message || "Something went wrong.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setServerError("An unexpected error occurred.");
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              {serverError && (
                <div className="text-sm text-destructive text-center">
                  {serverError}
                </div>
              )}

              <div className="grid gap-6">
                {/* Name Fields */}
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField
                    label="First Name"
                    error={errors.firstName?.message}
                  >
                    <Input {...register("firstName")} placeholder="John" />
                  </FormField>
                  <FormField label="Last Name" error={errors.lastName?.message}>
                    <Input {...register("lastName")} placeholder="Doe" />
                  </FormField>
                </div>

                <FormField
                  label="Middle Name"
                  error={errors.middleName?.message}
                >
                  <Input {...register("middleName")} placeholder="Optional" />
                </FormField>

                {/* Gender and Birthday */}
                <div className="grid gap-3 md:grid-cols-2">
                  <FormField label="Gender" error={errors.gender?.message}>
                    <Controller
                      name="gender"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormField>
                  <FormField label="Birthday" error={errors.birthday?.message}>
                    <Input {...register("birthday")} type="date" />
                  </FormField>
                </div>

                {/* Contact Information */}
                <FormField label="Phone Number" error={errors.phone?.message}>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <PhoneInput
                        value={field.value}
                        onChange={field.onChange}
                        defaultCountry="PH"
                        international
                      />
                    )}
                  />
                </FormField>

                <FormField label="Email" error={errors.email?.message}>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="m@example.com"
                  />
                </FormField>

                <FormField label="Password" error={errors.password?.message}>
                  <Input
                    {...register("password")}
                    type="password"
                    placeholder="••••••"
                  />
                </FormField>

                <FormField
                  label="Confirm Password"
                  error={errors.confirmPassword?.message}
                >
                  <Input
                    {...register("confirmPassword")}
                    type="password"
                    placeholder="••••••"
                  />
                </FormField>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create account"
                  )}
                </Button>
              </div>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/sign-in" className="underline underline-offset-4">
                  Sign in
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
