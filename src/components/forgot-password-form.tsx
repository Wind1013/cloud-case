"use client";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/auth-client";
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(""); // Clear previous messages
    setIsSuccess(null);

    try {
      await requestPasswordReset({
        email,
        // Ensure you escape the template literal backticks if needed, but in TSX/JS,
        // it should be concatenated or use a template literal directly if it's correct.
        // Assuming this is the correct format for your backend/redirect logic:
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setMessage("A password reset link has been sent to your email address.");
      setIsSuccess(true);
    } catch (error) {
      // You might get a more specific error message from your 'auth-client' in a real app
      setMessage(
        "Failed to send reset email. Please check your email and try again."
      );
      setIsSuccess(false);
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
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" loading={isLoading}>
            Request Password Reset
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
