"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartBar,
  ChartLineUp,
  Users,
  ForkKnife,
  Ticket,
  ClockCounterClockwise,
  MapPin,
  List,
  X,
  GearSix,
  Sliders,
  ShieldCheck,
  UserGear,
  ListChecks,
  Key,
  CaretDown,
  CurrencyDollar,
} from "@phosphor-icons/react";

interface NavLink {
  type: "link";
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  type: "group";
  label: string;
  icon: React.ReactNode;
  items: { label: string; href: string; icon: React.ReactNode }[];
}

type NavEntry = NavLink | NavGroup;

const navEntries: NavEntry[] = [
  {
    type: "link",
    label: "Dashboard",
    href: "/dashboard",
    icon: <ChartBar size={20} />,
  },
  {
    type: "group",
    label: "Estatisticas",
    icon: <ChartLineUp size={20} />,
    items: [
      { label: "Usuarios", href: "/dashboard/stats/users", icon: <Users size={18} /> },
      { label: "Financeiro", href: "/dashboard/stats/financial", icon: <CurrencyDollar size={18} /> },
    ],
  },
  {
    type: "group",
    label: "Usuarios",
    icon: <Users size={20} />,
    items: [
      { label: "Lista", href: "/dashboard/users", icon: <Users size={18} /> },
      { label: "Dist. Geografica", href: "/dashboard/geo-distribution", icon: <MapPin size={18} /> },
    ],
  },
  {
    type: "link",
    label: "Restaurantes",
    href: "/dashboard/restaurants",
    icon: <ForkKnife size={20} />,
  },
  {
    type: "link",
    label: "Vouchers",
    href: "/dashboard/vouchers",
    icon: <Ticket size={20} />,
  },
  {
    type: "group",
    label: "Sistema",
    icon: <GearSix size={20} />,
    items: [
      { label: "Configuracao Geral", href: "/dashboard/system/settings", icon: <Sliders size={18} /> },
      { label: "Logs de Auditoria", href: "/dashboard/audit-logs", icon: <ClockCounterClockwise size={18} /> },
    ],
  },
  {
    type: "group",
    label: "Controle de Admin",
    icon: <ShieldCheck size={20} />,
    items: [
      { label: "Usuarios e Cargos", href: "/dashboard/admin/users-roles", icon: <UserGear size={18} /> },
      { label: "Acoes do Sistema", href: "/dashboard/admin/permissions", icon: <ListChecks size={18} /> },
      { label: "Permissoes por Cargo", href: "/dashboard/admin/role-permissions", icon: <Key size={18} /> },
    ],
  },
];

function getGroupHrefs(entry: NavGroup): string[] {
  return entry.items.map((i) => i.href);
}

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  // Auto-expand group containing active page
  useEffect(() => {
    const activeGroups = new Set<string>();
    for (const entry of navEntries) {
      if (entry.type === "group") {
        const hrefs = getGroupHrefs(entry);
        if (hrefs.some((h) => pathname === h || pathname.startsWith(h + "/"))) {
          activeGroups.add(entry.label);
        }
      }
    }
    setOpenGroups((prev) => {
      const merged = new Set(prev);
      activeGroups.forEach((g) => merged.add(g));
      return merged;
    });
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }
      return next;
    });
  };

  const isGroupActive = (entry: NavGroup) => {
    return getGroupHrefs(entry).some((h) => pathname === h || pathname.startsWith(h + "/"));
  };

  const linkClasses = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
      active
        ? "bg-[var(--color-roc-primary)] text-white shadow-sm"
        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
    }`;

  const subLinkClasses = (active: boolean) =>
    `flex items-center gap-3 pl-10 pr-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
      active
        ? "bg-[var(--color-roc-primary)]/20 text-[var(--color-roc-primary)]"
        : "text-slate-500 hover:bg-white/5 hover:text-slate-300"
    }`;

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

        {navEntries.map((entry) => {
          if (entry.type === "link") {
            const active = isActive(entry.href);
            return (
              <Link
                key={entry.href}
                href={entry.href}
                onClick={() => setMobileOpen(false)}
                className={linkClasses(active)}
              >
                <span className={active ? "text-white" : "text-slate-500"}>
                  {entry.icon}
                </span>
                {entry.label}
              </Link>
            );
          }

          // Group
          const open = openGroups.has(entry.label);
          const groupActive = isGroupActive(entry);

          return (
            <div key={entry.label}>
              <button
                type="button"
                onClick={() => toggleGroup(entry.label)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150
                  ${groupActive ? "text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}
                `}
              >
                <span className={groupActive ? "text-white" : "text-slate-500"}>
                  {entry.icon}
                </span>
                <span className="flex-1 text-left">{entry.label}</span>
                <CaretDown
                  size={14}
                  className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-200 ease-in-out ${
                  open ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="space-y-0.5 pt-0.5">
                  {entry.items.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={subLinkClasses(active)}
                      >
                        <span className={active ? "text-[var(--color-roc-primary)]" : "text-slate-600"}>
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-4 pt-3 border-t border-white/5">
        <a
          href={process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000"}
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
