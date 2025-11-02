import { LoginForm } from "@/components/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 self-center w-full">
          <div className="relative w-full aspect-[3/2]">
            <Image
              fill
              src="/logo.png"
              alt="Atty. Michael B. Bongalonta Law Office"
              className="object-contain"
              priority
            />
          </div>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
