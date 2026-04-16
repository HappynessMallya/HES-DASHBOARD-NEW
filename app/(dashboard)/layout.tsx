"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { AlertCountProvider } from "@/lib/alert-context";
import { QueryProvider } from "@/lib/query-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <AlertCountProvider>
          <Sidebar />
          <main className="lg:pl-60">
            <div className="px-4 py-6 pt-20 lg:px-8 lg:pt-6">
              <Breadcrumb />
              {children}
            </div>
          </main>
          <Toaster richColors position="top-right" />
        </AlertCountProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
