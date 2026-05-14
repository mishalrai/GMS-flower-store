"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { ToastProvider } from "@/components/admin/Toast";
import { SidebarProvider, useSidebar } from "@/components/admin/SidebarContext";

function AdminShell({
  children,
  fullWidth,
}: {
  children: React.ReactNode;
  fullWidth: boolean;
}) {
  const { collapsed } = useSidebar();
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className={`transition-[margin-left] duration-200 ${collapsed ? "ml-0" : "ml-64"}`}>
        <AdminTopbar />
        <main className={fullWidth ? "p-6" : "p-6 max-w-6xl mx-auto"}>{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  // Routes that should span the full available admin width
  const isFullWidth = /^\/admin\/pages\/[^/]+\/edit$/.test(pathname ?? "");

  if (isLoginPage) {
    return <ToastProvider>{children}</ToastProvider>;
  }

  return (
    <ToastProvider>
      <SidebarProvider>
        <AdminShell fullWidth={isFullWidth}>{children}</AdminShell>
      </SidebarProvider>
    </ToastProvider>
  );
}
