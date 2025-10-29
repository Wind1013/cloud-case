"use client";
import { useState } from "react";
import { z } from "zod";
import { changeEmail, getSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, Loader2, Mail } from "lucide-react";

// Zod schema for email validation
const emailSchema = z.object({
  newEmail: z
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
});

export default function ChangeEmailClient({
  isVerified,
}: {
  isVerified: boolean;
}) {
  const [newEmail, setNewEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setIsSuccess(null);
    setValidationError("");
    setIsLoading(true);

    try {
      // Validate email with Zod
      const validation = emailSchema.safeParse({ newEmail });

      if (!validation.success) {
        const error = validation.error.message;
        setValidationError(error);
        setIsLoading(false);
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
    } catch (error) {
      setMessage("Failed to change email. Please try again.");
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmail(e.target.value);
    // Clear validation error when user types
    if (validationError) {
      setValidationError("");
    }
  };

  return (
    <div className="h-full grid place-content-center">
      <Card className="w-[400px] mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Change Email
          </CardTitle>
          <CardDescription>Enter your new email address below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">New Email</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="Enter your new email"
                value={newEmail}
                onChange={handleEmailChange}
                required
                disabled={isLoading}
                className={validationError ? "border-red-500" : ""}
              />
              {validationError && (
                <p className="text-sm text-red-500 mt-1">{validationError}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Change Email"
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
      </Card>
    </div>
  );
}
