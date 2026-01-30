"use client";

import { useEffect, useState } from "react";
import { adminApi } from "../lib/api";
import { StatsCard } from "../components/StatsCard";
import {
  Users,
  CreditCard,
  Ticket,
  CurrencyDollar,
  CheckCircle,
  Clock,
} from "@phosphor-icons/react";

interface DashboardData {
  totalUsers: number;
  activePasses: number;
  estimatedRevenue: number;
  vouchers: { total: number; available: number; used: number; expired: number };
  recentValidations: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-white shadow-soft" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-white shadow-soft" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Usuarios"
          value={data.totalUsers}
          icon={<Users size={24} weight="fill" />}
          color="#0056b3"
        />
        <StatsCard
          label="Passes Ativos"
          value={data.activePasses}
          icon={<CreditCard size={24} weight="fill" />}
          color="#16a34a"
        />
        <StatsCard
          label="Receita Estimada"
          value={`R$ ${data.estimatedRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={<CurrencyDollar size={24} weight="fill" />}
          color="#f59e0b"
        />
        <StatsCard
          label="Vouchers Usados"
          value={`${data.vouchers.used} / ${data.vouchers.total}`}
          icon={<Ticket size={24} weight="fill" />}
          color="#8b5cf6"
        />
      </div>

      {/* Voucher Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <Ticket size={20} weight="fill" className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-text-dark)]">{data.vouchers.available}</p>
              <p className="text-xs text-[var(--color-text-medium)]">Disponiveis</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <CheckCircle size={20} weight="fill" className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-text-dark)]">{data.vouchers.used}</p>
              <p className="text-xs text-[var(--color-text-medium)]">Utilizados</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
              <Clock size={20} weight="fill" className="text-gray-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[var(--color-text-dark)]">{data.vouchers.expired}</p>
              <p className="text-xs text-[var(--color-text-medium)]">Expirados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Validacoes Recentes */}
      <div className="rounded-xl bg-white shadow-soft">
        <div className="border-b border-[var(--color-border)] px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--color-text-dark)]">
            Validacoes Recentes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-[var(--color-text-medium)]">
                <th className="px-6 py-3">Codigo</th>
                <th className="px-6 py-3">Usuario</th>
                <th className="px-6 py-3">Restaurante</th>
                <th className="px-6 py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {data.recentValidations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-[var(--color-text-medium)]">
                    Nenhuma validacao recente
                  </td>
                </tr>
              ) : (
                data.recentValidations.map((v: any) => (
                  <tr
                    key={v.id}
                    className="border-b border-[var(--color-border)] transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-3 font-mono text-sm">{v.code}</td>
                    <td className="px-6 py-3 text-sm">{v.userName || "—"}</td>
                    <td className="px-6 py-3 text-sm">{v.restaurantName || "—"}</td>
                    <td className="px-6 py-3 text-sm text-[var(--color-text-medium)]">
                      {v.usedAt
                        ? new Date(v.usedAt).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
