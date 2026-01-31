"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { adminApi } from "../lib/api";
import { StatsCard } from "../components/StatsCard";
import {
  Users,
  CreditCard,
  Ticket,
  CurrencyDollar,
  Copy,
  Check,
} from "@phosphor-icons/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-white shadow-soft" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-72 animate-pulse rounded-xl bg-white shadow-soft" />
          <div className="h-72 animate-pulse rounded-xl bg-white shadow-soft" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const usagePercent = data.vouchers.total > 0
    ? ((data.vouchers.used / data.vouchers.total) * 100).toFixed(1)
    : "0";

  // Aggregate restaurant validation counts
  const restaurantCounts: Record<string, number> = {};
  data.recentValidations.forEach((v: any) => {
    const name = v.restaurantName || "Desconhecido";
    restaurantCounts[name] = (restaurantCounts[name] || 0) + 1;
  });
  const topRestaurants = Object.entries(restaurantCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({
      name: name.length > 15 ? name.slice(0, 15) + "..." : name,
      validacoes: count,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">Dashboard</h1>
        <p className="text-sm text-[var(--color-text-medium)] mt-0.5">
          Visao geral do ROC Passaporte
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          label="Total Usuarios"
          value={data.totalUsers}
          icon={<Users size={22} />}
          color="#0056b3"
          subtitle={`${data.activePasses} com passe ativo`}
        />
        <StatsCard
          label="Passes Ativos"
          value={data.activePasses}
          icon={<CreditCard size={22} />}
          color="#16a34a"
          subtitle={`de ${data.totalUsers} usuarios`}
        />
        <StatsCard
          label="Receita Estimada"
          value={`R$ ${data.estimatedRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          icon={<CurrencyDollar size={22} />}
          color="#f59e0b"
          subtitle="baseado nos passes ativos"
        />
        <StatsCard
          label="Taxa de Uso de Vouchers"
          value={`${usagePercent}%`}
          icon={<Ticket size={22} />}
          color="#8b5cf6"
          progress={{ value: data.vouchers.used, max: data.vouchers.total }}
        />
      </div>

      {/* Status de Vouchers + Grafico */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Voucher Status Summary */}
        <div className="rounded-xl bg-white shadow-soft p-6">
          <h2 className="text-base font-semibold text-[var(--color-text-dark)] mb-4">
            Status dos Vouchers
          </h2>
          <div className="space-y-4">
            {[
              { label: "Disponiveis", value: data.vouchers.available, color: "#16a34a" },
              { label: "Utilizados", value: data.vouchers.used, color: "#3b82f6" },
              { label: "Expirados", value: data.vouchers.expired, color: "#94a3b8" },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-[var(--color-text-dark)]">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--color-text-dark)]">{item.value}</span>
                    <span className="text-xs text-[var(--color-text-light)] w-10 text-right">
                      {data.vouchers.total > 0
                        ? ((item.value / data.vouchers.total) * 100).toFixed(0)
                        : 0}%
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${data.vouchers.total > 0 ? (item.value / data.vouchers.total) * 100 : 0}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-medium)]">Total de vouchers</span>
            <span className="text-lg font-bold text-[var(--color-text-dark)]">{data.vouchers.total}</span>
          </div>
        </div>

        {/* Top 5 Restaurants Bar Chart */}
        <div className="rounded-xl bg-white shadow-soft p-6">
          <h2 className="text-base font-semibold text-[var(--color-text-dark)] mb-4">
            Top Restaurantes (Validacoes Recentes)
          </h2>
          {topRestaurants.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topRestaurants} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#64748b" }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12, fill: "#1e293b" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="validacoes" fill="#0056b3" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-sm text-[var(--color-text-light)]">
              Nenhuma validacao recente
            </div>
          )}
        </div>
      </div>

      {/* Validacoes Recentes */}
      <div className="rounded-xl bg-white shadow-soft">
        <div className="border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--color-text-dark)]">
            Validacoes Recentes
          </h2>
          <Link
            href="/dashboard/vouchers"
            className="text-xs font-medium text-[var(--color-roc-primary)] hover:underline"
          >
            Ver todos
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-medium)]">
                <th className="px-6 py-3">Codigo</th>
                <th className="px-6 py-3">Usuario</th>
                <th className="px-6 py-3">Restaurante</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentValidations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-[var(--color-text-light)]">
                    Nenhuma validacao recente
                  </td>
                </tr>
              ) : (
                data.recentValidations.map((v: any) => (
                  <tr
                    key={v.id}
                    className="border-b border-[var(--color-border)] transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{v.code}</span>
                        <button
                          onClick={() => copyCode(v.code, v.id)}
                          className="text-[var(--color-text-light)] hover:text-[var(--color-roc-primary)] transition-colors"
                          title="Copiar codigo"
                        >
                          {copiedId === v.id ? (
                            <Check size={14} className="text-green-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {v.userName ? (
                        <Link href="/dashboard/users" className="text-[var(--color-roc-primary)] hover:underline">
                          {v.userName}
                        </Link>
                      ) : (
                        <span className="text-[var(--color-text-light)]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {v.restaurantName ? (
                        <Link href="/dashboard/restaurants" className="text-[var(--color-roc-primary)] hover:underline">
                          {v.restaurantName}
                        </Link>
                      ) : (
                        <span className="text-[var(--color-text-light)]">—</span>
                      )}
                    </td>
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
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        Validado
                      </span>
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
