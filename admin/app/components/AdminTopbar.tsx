"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";
import { adminApi } from "../lib/api";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/users": "Usuarios",
  "/dashboard/restaurants": "Restaurantes",
  "/dashboard/vouchers": "Vouchers",
  "/dashboard/audit-logs": "Audit Logs",
};

function derivePageTitle(pathname: string): string {
  // Exact match first
  if (pageTitles[pathname]) {
    return pageTitles[pathname];
  }

  // Check for sub-paths (e.g. /dashboard/users/123)
  const sortedPaths = Object.keys(pageTitles).sort(
    (a, b) => b.length - a.length
  );
  for (const path of sortedPaths) {
    if (pathname.startsWith(path)) {
      return pageTitles[path];
    }
  }

  return "Admin";
}

export function AdminTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState("Admin");
  const [adminRole, setAdminRole] = useState("admin");

  useEffect(() => {
    setAdminName(adminApi.getAdminName());
    setAdminRole(adminApi.getAdminRole());
  }, []);

  const handleLogout = () => {
    adminApi.clearAuth();
    router.push("/login");
  };

  const title = derivePageTitle(pathname);

  const roleLabel =
    adminRole === "super_admin" ? "Super Admin" : "Admin";

  return (
    <header
      className="sticky top-0 z-10 h-16 flex items-center justify-between px-6 lg:px-8
        bg-white border-b border-[var(--color-border)]"
    >
      {/* Left: page title (offset on mobile for hamburger button) */}
      <h1 className="text-xl font-semibold text-[var(--color-text-dark)] pl-12 lg:pl-0">
        {title}
      </h1>

      {/* Right: admin info + logout */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium text-[var(--color-text-dark)]">
            {adminName}
          </span>
          <span
            className={`
              text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full
              ${
                adminRole === "super_admin"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }
            `}
          >
            {roleLabel}
          </span>
        </div>

        <button
          onClick={handleLogout}
          title="Sair"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
            text-[var(--color-text-medium)] hover:text-[var(--color-roc-danger)]
            hover:bg-red-50 transition-colors duration-150"
        >
          <SignOut size={20} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
