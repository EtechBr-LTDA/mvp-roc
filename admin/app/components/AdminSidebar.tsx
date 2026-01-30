"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartBar,
  Users,
  ForkKnife,
  Ticket,
  ClockCounterClockwise,
  ArrowSquareOut,
  List,
  X,
} from "@phosphor-icons/react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <ChartBar size={22} />,
  },
  {
    label: "Usuarios",
    href: "/dashboard/users",
    icon: <Users size={22} />,
  },
  {
    label: "Restaurantes",
    href: "/dashboard/restaurants",
    icon: <ForkKnife size={22} />,
  },
  {
    label: "Vouchers",
    href: "/dashboard/vouchers",
    icon: <Ticket size={22} />,
  },
  {
    label: "Audit Logs",
    href: "/dashboard/audit-logs",
    icon: <ClockCounterClockwise size={22} />,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-[var(--color-roc-primary)] flex items-center justify-center">
          <span className="text-white font-bold text-sm">R</span>
        </div>
        <span className="text-white text-lg font-semibold tracking-tight">
          ROC Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-colors duration-150
                ${
                  active
                    ? "bg-[var(--color-admin-sidebar-active)] text-white"
                    : "text-slate-300 hover:bg-[var(--color-admin-sidebar-hover)] hover:text-white"
                }
              `}
            >
              <span className={active ? "text-white" : "text-slate-400"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* External link */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            text-slate-400 hover:bg-[var(--color-admin-sidebar-hover)] hover:text-white
            transition-colors duration-150"
        >
          <ArrowSquareOut size={22} />
          Abrir site
        </a>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg
          bg-[var(--color-admin-sidebar)] text-white shadow-medium"
        aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
      >
        {mobileOpen ? <X size={24} /> : <List size={24} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - mobile */}
      <aside
        className={`
          lg:hidden fixed inset-y-0 left-0 z-40 w-64 flex flex-col
          bg-[var(--color-admin-sidebar)] transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar - desktop */}
      <aside
        className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 z-20
          bg-[var(--color-admin-sidebar)]"
      >
        {sidebarContent}
      </aside>
    </>
  );
}
