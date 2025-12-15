import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/ui/sonner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getAuthSession } from "@/data/auth";
import ModalProvider from "@/providers/modal-context";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getAuthSession(); // This will redirect if no session
  const user = session.user;
  
  // Redirect unverified users to email verification page
  if (!user.emailVerified) {
    redirect("/email-verified");
  }
  
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <NuqsAdapter>
        <ModalProvider>
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex-1 overflow-auto">{children}</div>
            <Toaster />
          </SidebarInset>
        </ModalProvider>
      </NuqsAdapter>
    </SidebarProvider>
  );
}
