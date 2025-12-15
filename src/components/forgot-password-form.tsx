"use client";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Assuming you have these common UI components from a library like shadcn/ui
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, AlertTriangle } from "lucide-react"; // Icons for better visual feedback

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null); // State to track success/error
  const [emailError, setEmailError] = useState("");

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return "Email address is required.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value.trim())) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  const normalizeEmail = (value: string) => value.trim().toLowerCase();

  const extractErrorMessage = (error: unknown) => {
    if (typeof error === "string") return error;
    if (error instanceof Error) return error.message;
    if (error && typeof error === "object") {
      const dataMessage =
        (error as { data?: { message?: string; error?: string } }).data?.message ||
        (error as { data?: { message?: string; error?: string } }).data?.error;
      if (dataMessage) return dataMessage;
    }
    return "Failed to send reset email. Please try again.";
  };

  const checkEmailExists = async (value: string) => {
    const response = await fetch("/api/auth/check-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: value }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error || "Unable to validate email address.");
    }

    return Boolean(data?.exists);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(""); // Clear previous messages
    setIsSuccess(null);

    const trimmedEmail = normalizeEmail(email);
    const validationError = validateEmail(trimmedEmail);
    if (validationError) {
      setEmailError(validationError);
      setIsLoading(false);
      return;
    }

    setEmailError("");

    try {
      const emailExists = await checkEmailExists(trimmedEmail);
      if (!emailExists) {
        const notFoundMsg = "We couldn't find an account with that email address.";
        setEmailError(notFoundMsg);
        setIsSuccess(false);
        return;
      }

      await requestPasswordReset({
        email: trimmedEmail,
        // Ensure you escape the template literal backticks if needed, but in TSX/JS,
        // it should be concatenated or use a template literal directly if it's correct.
        // Assuming this is the correct format for your backend/redirect logic:
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setMessage("A password reset link has been sent to your email address.");
      setIsSuccess(true);
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      const lowerMessage = errorMessage.toLowerCase();

      if (
        lowerMessage.includes("user") &&
        (lowerMessage.includes("not found") || lowerMessage.includes("does not exist") || lowerMessage.includes("no account"))
      ) {
        setEmailError("We couldn't find an account with that email address.");
        setIsSuccess(false);
      } else {
        setMessage(errorMessage);
        setIsSuccess(false);
      }
      // You might get a more specific error message from your 'auth-client' in a real app
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[380px] mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Forgot Your Password?</CardTitle>
        <CardDescription>
          Enter your email below to receive a password reset link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (emailError) {
                  setEmailError("");
                }
              }}
              required
            />
            {emailError && (
              <p className="text-sm text-destructive" role="alert">
                {emailError}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" loading={isLoading}>
            Request Password Reset
          </Button>

          <Button variant="outline" className="w-full" asChild>
            <Link href="/sign-in">Back to Sign In</Link>
          </Button>

          {message && (
            <Alert variant={isSuccess ? "default" : "destructive"}>
              {isSuccess ? (
                <Mail className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertTitle>{isSuccess ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
