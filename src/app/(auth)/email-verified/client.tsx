"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, CheckCircle2 } from "lucide-react";
import { sendVerificationEmail } from "@/lib/auth-client";
import { toast } from "sonner";
import Link from "next/link";

export default function EmailVerifiedClient({ email }: { email: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResendVerification = async () => {
    if (!email) {
      console.error("❌ [RESEND] No email address found");
      toast.error("Email address not found. Please sign up again.");
      return;
    }

    console.log("📧 [RESEND] Attempting to resend verification email to:", email);
    setIsLoading(true);
    const toastId = toast.loading("Sending verification email...");
    
    try {
      console.log("📧 [RESEND] Calling sendVerificationEmail...");
      const result = await sendVerificationEmail({ email });
      console.log("📧 [RESEND] Email result:", result);
      
      setEmailSent(true);
      toast.success("Verification email sent successfully! Please check your inbox.", { id: toastId });
      console.log("✅ [RESEND] Email sent successfully (client confirmation)");
    } catch (error: any) {
      console.error("❌ [RESEND] Failed to send verification email:");
      console.error("   Error:", error);
      console.error("   Message:", error?.message);
      console.error("   Stack:", error?.stack);
      toast.error("Failed to send verification email. Please try again.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription className="text-base">
            We've sent a verification link to
            <br />
            <span className="font-semibold text-foreground">{email || "your email address"}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4 rounded-lg border bg-muted/50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium">What to do next:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Check your inbox for the verification email</li>
                  <li>Click the verification link in the email</li>
                  <li>You'll be automatically signed in after verification</li>
                </ol>
              </div>
            </div>
          </div>

          {emailSent && (
            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 p-4">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Verification email sent!
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Please check your inbox and spam folder.
                </p>
              </div>
            </div>
          )}

          <Button
            onClick={handleResendVerification}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Resend verification email
              </>
            )}
          </Button>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
            <Link
              href="/sign-in"
              className="text-sm text-primary hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

