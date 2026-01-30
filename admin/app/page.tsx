"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "./lib/api";

export default function AdminRoot() {
  const router = useRouter();

  useEffect(() => {
    if (adminApi.isAuthenticated()) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-roc-primary)]" />
    </div>
  );
}
