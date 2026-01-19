"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CreditCard,
  Plus,
  Trash,
  PencilSimple,
  Check,
  ShieldCheck,
  ArrowLeft,
  Receipt,
  CalendarBlank,
  CurrencyCircleDollar,
  CheckCircle,
  Clock,
  Warning,
} from "@phosphor-icons/react";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { apiClient } from "@/app/lib/api";

interface PaymentMethod {
  id: string;
  type: "credit" | "debit" | "pix";
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

interface Purchase {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "paid" | "pending" | "failed";
}

export default function PaymentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Dados mockados (em produção, viriam do backend)
  const [paymentMethods] = useState<PaymentMethod[]>([]);

  const [purchases] = useState<Purchase[]>([
    {
      id: "1",
      date: "2026-01-15",
      description: "ROC Passaporte - Assinatura Anual",
      amount: 79.90,
      status: "paid",
    },
  ]);

  useEffect(() => {
    // Verificar autenticação
    if (!apiClient.isAuthenticated()) {
      router.push("/auth/login");
      return;
    }
    setIsLoading(false);
  }, [router]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getStatusBadge = (status: Purchase["status"]) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-roc-success)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-roc-success)]">
            <CheckCircle size={14} weight="fill" />
            Pago
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-roc-warning)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-roc-warning)]">
            <Clock size={14} weight="fill" />
            Pendente
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-roc-danger)]/10 px-2.5 py-1 text-xs font-medium text-[var(--color-roc-danger)]">
            <Warning size={14} weight="fill" />
            Falhou
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-light)]">
        <Header />
        <main className="pt-24 pb-12">
          <div className="mx-auto max-w-3xl px-4">
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-roc-primary)] border-t-transparent" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      <Header />

      <main className="pt-24 pb-12">
        <div className="mx-auto max-w-3xl px-4">
          {/* Header da página */}
          <div className="mb-6">
            <button
              onClick={() => router.push("/account/vouchers")}
              className="mb-4 flex items-center gap-2 text-sm text-[var(--color-text-medium)] hover:text-[var(--color-roc-primary)] transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar para vouchers
            </button>
            <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">
              Pagamento
            </h1>
            <p className="text-sm text-[var(--color-text-medium)]">
              Gerencie seus métodos de pagamento e histórico de compras
            </p>
          </div>

          {/* Card de métodos de pagamento */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-6 shadow-soft mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-roc-primary)]/10">
                  <CreditCard size={24} weight="fill" className="text-[var(--color-roc-primary)]" />
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--color-text-dark)]">
                    Métodos de Pagamento
                  </h2>
                  <p className="text-xs text-[var(--color-text-medium)]">
                    Seus cartões e formas de pagamento salvas
                  </p>
                </div>
              </div>
            </div>

            {paymentMethods.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-[var(--color-border)] p-8 text-center">
                <CreditCard size={40} className="mx-auto mb-3 text-[var(--color-text-medium)]" />
                <p className="text-[var(--color-text-dark)] font-medium mb-1">
                  Nenhum método de pagamento cadastrado
                </p>
                <p className="text-sm text-[var(--color-text-medium)] mb-4">
                  Adicione um cartão para facilitar suas próximas compras
                </p>
                <button className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-roc-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-roc-primary-dark)]">
                  <Plus size={18} />
                  Adicionar cartão
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex items-center justify-between rounded-xl border border-[var(--color-border)] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-bg-light)]">
                        <CreditCard size={20} className="text-[var(--color-text-medium)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-text-dark)]">
                          {method.brand} **** {method.last4}
                        </p>
                        <p className="text-xs text-[var(--color-text-medium)]">
                          Expira em {method.expiryMonth}/{method.expiryYear}
                        </p>
                      </div>
                      {method.isDefault && (
                        <span className="rounded-full bg-[var(--color-roc-success)]/10 px-2 py-0.5 text-xs font-medium text-[var(--color-roc-success)]">
                          Padrão
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-lg p-2 text-[var(--color-text-medium)] hover:bg-[var(--color-bg-light)] transition-colors">
                        <PencilSimple size={18} />
                      </button>
                      <button className="rounded-lg p-2 text-[var(--color-roc-danger)] hover:bg-[var(--color-roc-danger)]/10 transition-colors">
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                ))}
                <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] py-3 text-sm font-medium text-[var(--color-text-medium)] hover:border-[var(--color-roc-primary)] hover:text-[var(--color-roc-primary)] transition-colors">
                  <Plus size={18} />
                  Adicionar novo cartão
                </button>
              </div>
            )}
          </motion.div>

          {/* Card de histórico de compras */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white p-6 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-roc-primary)]/10">
                <Receipt size={24} weight="fill" className="text-[var(--color-roc-primary)]" />
              </div>
              <div>
                <h2 className="font-semibold text-[var(--color-text-dark)]">
                  Histórico de Compras
                </h2>
                <p className="text-xs text-[var(--color-text-medium)]">
                  Suas transações e pagamentos
                </p>
              </div>
            </div>

            {purchases.length === 0 ? (
              <div className="rounded-xl bg-[var(--color-bg-light)] p-8 text-center">
                <Receipt size={40} className="mx-auto mb-3 text-[var(--color-text-medium)]" />
                <p className="text-[var(--color-text-dark)] font-medium">
                  Nenhuma compra realizada
                </p>
                <p className="text-sm text-[var(--color-text-medium)]">
                  Suas compras aparecerão aqui
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between rounded-xl border border-[var(--color-border)] p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-bg-light)]">
                        <CurrencyCircleDollar size={20} className="text-[var(--color-roc-primary)]" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-text-dark)]">
                          {purchase.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-medium)]">
                          <CalendarBlank size={12} />
                          {formatDate(purchase.date)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold text-[var(--color-text-dark)]">
                        {formatCurrency(purchase.amount)}
                      </p>
                      {getStatusBadge(purchase.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Info de segurança */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--color-text-medium)]">
            <ShieldCheck size={16} weight="fill" className="text-[var(--color-roc-success)]" />
            <span>Pagamentos processados com segurança via SSL</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
