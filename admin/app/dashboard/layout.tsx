"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "../lib/api";
import { AdminSidebar } from "../components/AdminSidebar";
import { AdminTopbar } from "../components/AdminTopbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!adminApi.isAuthenticated()) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-roc-primary)]" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-64">
        <AdminTopbar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
