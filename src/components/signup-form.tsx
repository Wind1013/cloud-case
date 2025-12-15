"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { isValidPhoneNumberSync } from "@/lib/phone-validation";
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
import { PhoneInputSimple as PhoneInput } from "@/components/ui/phone-input-simple";
import { signUp, sendVerificationEmail } from "@/lib/auth-client";
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
      .min(1, "Phone number is required")
      .refine(
        value => isValidPhoneNumberSync(value, "PH"),
        {
          message: "Please enter a valid Philippine phone number (e.g., 09123456789 or +63 912 345 6789)"
        }
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
  const lastValidPhoneRef = useRef<string>("");

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

  // Update ref when phone value changes (from form)
  useEffect(() => {
    if (phone) {
      lastValidPhoneRef.current = phone;
    }
  }, [phone]);

  async function onSubmit(data: SignUpFormData) {
    setServerError(null);

    const userData: any = {
      name: `${data.firstName} ${data.lastName}`.trim(),
      email: data.email,
      password: data.password,
      firstName: data.firstName || undefined,
      lastName: data.lastName || undefined,
      middleName: data.middleName || undefined,
      gender: data.gender || undefined,
      phone: data.phone || undefined,
    };

    // Only include birthday if it has a value
    if (data.birthday) {
      userData.birthday = new Date(data.birthday);
    }
    
    // Remove undefined values to avoid issues with better-auth
    Object.keys(userData).forEach(key => {
      if (userData[key] === undefined || userData[key] === "") {
        delete userData[key];
      }
    });

    try {
      console.log("🚀 [SIGNUP] Starting signup process for:", userData.email);
      console.log("🚀 [SIGNUP] User data:", { ...userData, password: "[HIDDEN]" });
      
      const res = await signUp.email({
        ...userData,
        callbackURL: "/email-verified",
      });

      console.log("🚀 [SIGNUP] Response received:", { 
        hasError: !!res.error, 
        hasData: !!res.data,
        error: res.error 
      });

      if (res.error) {
        console.error("❌ [SIGNUP] Error:", res.error);
        console.error("❌ [SIGNUP] Full error object:", JSON.stringify(res.error, null, 2));
        
        // Show more detailed error message
        let errorMessage = res.error.message || "Something went wrong.";
        
        // Check error code for specific cases
        if (res.error.code === 'FAILED_TO_CREATE_USER') {
          errorMessage = "Failed to create user account. Please check your information and try again.";
        }
        
        // Check if it's a duplicate email error
        const errorStr = JSON.stringify(res.error).toLowerCase();
        if (errorStr.includes('email') && (errorStr.includes('unique') || errorStr.includes('duplicate'))) {
          errorMessage = "This email is already registered. Please sign in instead.";
        }
        
        setServerError(errorMessage);
      } else {
        console.log("✅ [SIGNUP] Signup successful, user created");
        console.log("✅ [SIGNUP] User ID:", res.data?.user?.id);
        console.log("✅ [SIGNUP] Email verified:", res.data?.user?.emailVerified);
        console.log("ℹ️ [SIGNUP] NOTE: Check your server terminal for email sending logs (📧 📨 ✅ ❌)");
        
        // Better-auth should automatically send verification email when sendOnSignUp: true
        // Wait a moment for it to process, then check if we need to manually send
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Only manually send if emailVerified is still false (meaning auto-send might have failed)
        if (!res.data?.user?.emailVerified) {
          try {
            console.log("📧 [EMAIL] Auto-send may have failed, manually sending verification email to:", userData.email);
            console.log("ℹ️ [EMAIL] This will call the server API - check terminal for server logs");
            const emailRes = await sendVerificationEmail({ 
              email: userData.email,
              callbackURL: "/email-verified"
            });
            
            console.log("📧 [EMAIL] Email response:", emailRes);
            
            if (emailRes?.error) {
              console.error("❌ [EMAIL] Failed to send verification email:", emailRes.error);
              toast.error("Account created but failed to send verification email. Please use 'Resend' button.");
            } else {
              console.log("✅ [EMAIL] Verification email sent successfully (client confirmation)");
              toast.success("Account created! Please check your email for verification link.");
            }
          } catch (emailError: any) {
            console.error("❌ [EMAIL] Exception sending verification email:");
            console.error("   Error:", emailError);
            console.error("   Message:", emailError?.message);
            console.error("   Stack:", emailError?.stack);
            toast.warning("Account created but verification email may not have been sent. Please use 'Resend' button.");
          }
        } else {
          console.log("✅ [SIGNUP] User already verified, no need to send email");
          toast.success("Account created successfully!");
        }
        
        router.push("/email-verified");
      }
    } catch (err: any) {
      console.error("❌ [SIGNUP] Exception:");
      console.error("   Error:", err);
      console.error("   Message:", err?.message);
      console.error("   Stack:", err?.stack);
      setServerError("An unexpected error occurred. Please try again.");
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
                        <PhoneInput
                          value={field.value}
                          onChange={handlePhoneChange}
                          defaultCountry="PH"
                          international
                          maxLength={currentMaxLength}
                        />
                      );
                    }}
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
