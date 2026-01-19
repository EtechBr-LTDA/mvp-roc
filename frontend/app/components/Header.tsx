"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  SignOut,
  CaretDown,
  UserCircle,
  CreditCard,
  Headset,
  Ticket,
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/app/lib/api";

interface UserData {
  name: string;
  email: string;
}

export function Header() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Buscar dados do usuário do localStorage
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("user_name");
      const storedEmail = localStorage.getItem("user_email");

      if (storedName || storedEmail) {
        setUser({
          name: storedName || "Usuário",
          email: storedEmail || "",
        });
      }
    }
  }, []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    apiClient.clearAuth();
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_email");
    }
    router.push("/auth/login");
  };

  const menuItems = [
    {
      label: "Meus Vouchers",
      href: "/account/vouchers",
      icon: Ticket,
      description: "Ver todos os vouchers",
    },
    {
      label: "Meu Perfil",
      href: "/account/profile",
      icon: UserCircle,
      description: "Dados pessoais e endereço",
    },
    {
      label: "Pagamento",
      href: "/account/payment",
      icon: CreditCard,
      description: "Métodos de pagamento",
    },
    {
      label: "Suporte",
      href: "/account/support",
      icon: Headset,
      description: "Central de ajuda",
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-white)] shadow-soft">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-[var(--spacing-4)]">
        <Link href="/" className="text-xl font-bold tracking-tight">
          <span className="text-[var(--color-roc-primary)]">ROC</span> Passaporte
        </Link>

        <nav className="flex items-center gap-[var(--spacing-3)]">
          {/* Dropdown do usuário */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-[var(--spacing-2)] rounded-full border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-text-dark)] transition-all hover:bg-[var(--color-bg-light)] hover:border-[var(--color-roc-primary)]/30"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-roc-primary)]/10">
                <User size={18} weight="fill" className="text-[var(--color-roc-primary)]" />
              </div>
              <span className="hidden sm:inline max-w-[120px] truncate">
                {user?.name || "Usuário"}
              </span>
              <CaretDown
                size={16}
                weight="bold"
                className={`text-[var(--color-text-medium)] transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-[var(--color-border)] bg-white p-2 shadow-lg"
                >
                  {/* Header do usuário */}
                  <div className="mb-2 rounded-xl bg-[var(--color-bg-light)] p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-roc-primary)]">
                        <User size={20} weight="fill" className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[var(--color-text-dark)] truncate">
                          {user?.name || "Usuário"}
                        </p>
                        <p className="text-xs text-[var(--color-text-medium)] truncate">
                          {user?.email || ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="space-y-1">
                    {menuItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-[var(--color-bg-light)] group"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-bg-light)] group-hover:bg-white transition-colors">
                          <item.icon
                            size={20}
                            weight="fill"
                            className="text-[var(--color-text-medium)] group-hover:text-[var(--color-roc-primary)] transition-colors"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-[var(--color-text-dark)]">
                            {item.label}
                          </p>
                          <p className="text-xs text-[var(--color-text-medium)]">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="my-2 h-px bg-[var(--color-border)]" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-[var(--color-roc-danger)]/10 group"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-roc-danger)]/10">
                      <SignOut
                        size={20}
                        weight="fill"
                        className="text-[var(--color-roc-danger)]"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-[var(--color-roc-danger)]">
                        Sair da conta
                      </p>
                      <p className="text-xs text-[var(--color-text-medium)]">
                        Encerrar sessão
                      </p>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </div>
    </header>
  );
}
