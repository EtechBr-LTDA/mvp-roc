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
    icon: <ChartBar size={20} />,
  },
  {
    label: "Usuarios",
    href: "/dashboard/users",
    icon: <Users size={20} />,
  },
  {
    label: "Restaurantes",
    href: "/dashboard/restaurants",
    icon: <ForkKnife size={20} />,
  },
  {
    label: "Vouchers",
    href: "/dashboard/vouchers",
    icon: <Ticket size={20} />,
  },
  {
    label: "Audit Logs",
    href: "/dashboard/audit-logs",
    icon: <ClockCounterClockwise size={20} />,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-[var(--color-roc-primary)] flex items-center justify-center">
          <span className="text-white font-bold text-sm">R</span>
        </div>
        <div className="flex flex-col">
          <span className="text-white text-base font-semibold tracking-tight leading-tight">
            ROC Admin
          </span>
          <span className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">
            Painel
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Menu
        </p>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150
                ${
                  active
                    ? "bg-[var(--color-roc-primary)] text-white shadow-sm"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }
              `}
            >
              <span className={active ? "text-white" : "text-slate-500"}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-4 pt-3 border-t border-white/5">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
            text-slate-500 hover:text-slate-300 hover:bg-white/5
            transition-colors duration-150"
        >
          <div className="w-2 h-2 rounded-full bg-green-500" />
          Abrir site (usuario)
        </a>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
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
