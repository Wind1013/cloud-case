"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function UnauthorizedPage() {
  return (
    <>
      <main className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <div className="space-y-6 flex flex-col items-center justify-center">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">401 - Unauthorized</h1>
              <p className="text-muted-foreground">
                Please sign in to continue.
              </p>
            </div>
            <div>
              <Button asChild>
                <Link href={`/sign-in`}>Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
