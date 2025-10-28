"use client";

import { useState, useEffect } from "react";
import { resetPassword } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
// Import enhanced UI components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Loader2, Lock } from "lucide-react"; // Icons for feedback and style
import Link from "next/link"; // Assuming you are using Next.js Link for navigation

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Added confirmation field
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Assuming a hypothetical minimum password length for validation
  const MIN_PASSWORD_LENGTH = 8;

  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setToken(token);
    } else {
      // Immediately notify the user if the token is missing from the URL
      setMessage("Error: The password reset link is invalid or expired.");
      setIsSuccess(false);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages
    setIsSuccess(null);
    setIsLoading(true);

    if (!token) {
      setMessage("Invalid or missing reset token.");
      setIsSuccess(false);
      setIsLoading(false);
      return;
    }

    // Client-side validation
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setIsSuccess(false);
      setIsLoading(false);
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setMessage(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`
      );
      setIsSuccess(false);
      setIsLoading(false);
      return;
    }

    try {
      await resetPassword({
        newPassword: password,
        token,
      });
      setMessage("Success! Your password has been reset. You can now log in.");
      setIsSuccess(true);
    } catch (error) {
      // Use a generic message as the error details might be sensitive
      setMessage(
        "Could not reset password. The link may have expired or been used."
      );
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if the form should be disabled (on success or if token is missing)
  const isFormDisabled = isSuccess === true || !token || isLoading;

  return (
    <Card className="w-[400px] mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          Set New Password
        </CardTitle>
        <CardDescription>
          Enter your new password below. Ensure it's strong and unique.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder={`Minimum ${MIN_PASSWORD_LENGTH} characters`}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              disabled={isFormDisabled}
            />
          </div>

          {/* Added Confirmation Field for a better UX */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              disabled={isFormDisabled}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isFormDisabled}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Reset Password"
            )}
          </Button>

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
      </CardContent>

      {/* Footer to guide the user after success or failure */}
      <CardFooter className="flex justify-center pt-4 border-t mt-4">
        <Link href="/sign-in" className="text-sm text-primary hover:underline">
          Go back to Login
        </Link>
      </CardFooter>
    </Card>
  );
}
