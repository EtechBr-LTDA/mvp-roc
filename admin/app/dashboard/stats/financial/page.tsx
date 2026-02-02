"use client";

import { useEffect, useState } from "react";
import {
  CurrencyDollar,
  CreditCard,
  Clock,
  Ticket,
  TrendUp,
} from "@phosphor-icons/react";
import { adminApi } from "../../../lib/api";

type Period = "7d" | "30d" | "90d" | "12m";

function getPeriodDates(period: Period): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  switch (period) {
    case "7d":
      start.setDate(end.getDate() - 7);
      break;
    case "30d":
      start.setDate(end.getDate() - 30);
      break;
    case "90d":
      start.setDate(end.getDate() - 90);
      break;
    case "12m":
      start.setFullYear(end.getFullYear() - 1);
      break;
  }
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function StatsFinancialPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("12m");

  const loadStats = async (p: Period) => {
    setLoading(true);
    try {
      const dates = getPeriodDates(p);
      const data = await adminApi.getFinancialStats(dates);
      setStats(data);
    } catch (err: any) {
      console.error("Erro ao carregar stats financeiros:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats(period);
  }, [period]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-roc-primary)]" />
      </div>
    );
  }

  const totalRevenue = stats?.total_revenue || 0;
  const activePasses = stats?.active_passes || 0;
  const expiredPasses = stats?.expired_passes || 0;
  const passPrice = stats?.pass_price || 99.99;
  const periodRevenue = stats?.period_revenue || 0;
  const periodPasses = stats?.period_passes || 0;
  const monthly: { month: string; passes_count: number; revenue: number }[] =
    stats?.monthly_breakdown || [];
  const voucherStats = stats?.voucher_stats || { total: 0, available: 0, used: 0, expired: 0 };

  const maxMonthlyRevenue = Math.max(...monthly.map((m) => m.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-text-dark)]">
          Estatisticas Financeiras
        </h2>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(["7d", "30d", "90d", "12m"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                period === p
                  ? "bg-white text-[var(--color-roc-primary)] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {p === "12m" ? "12 meses" : p.replace("d", " dias")}
            </button>
          ))}
        </div>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<CurrencyDollar size={24} />}
          label="Receita Total"
          value={formatCurrency(totalRevenue)}
          color="green"
        />
        <MetricCard
          icon={<CreditCard size={24} />}
          label="Passes Ativos"
          value={activePasses.toLocaleString("pt-BR")}
          color="blue"
        />
        <MetricCard
          icon={<Clock size={24} />}
          label="Passes Expirados"
          value={expiredPasses.toLocaleString("pt-BR")}
          color="orange"
        />
        <MetricCard
          icon={<TrendUp size={24} />}
          label="Preco do Passe"
          value={formatCurrency(passPrice)}
          color="purple"
        />
      </div>

      {/* Period summary */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
        <h3 className="font-semibold text-[var(--color-text-dark)] mb-1">Resumo do Periodo</h3>
        <p className="text-sm text-gray-500 mb-4">
          {periodPasses} passes vendidos = {formatCurrency(periodRevenue)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly breakdown */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
          <h3 className="font-semibold text-[var(--color-text-dark)] mb-4">Receita Mensal</h3>

          {monthly.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Nenhum dado no periodo</p>
          ) : (
            <div className="space-y-3">
              {monthly.map((m) => {
                const pct = Math.round((m.revenue / maxMonthlyRevenue) * 100);
                return (
                  <div key={m.month}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{m.month}</span>
                      <span className="font-medium text-gray-800">
                        {formatCurrency(m.revenue)} ({m.passes_count} passes)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Voucher stats */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Ticket size={20} className="text-indigo-500" />
            <h3 className="font-semibold text-[var(--color-text-dark)]">Vouchers</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <VoucherStat label="Total" value={voucherStats.total} color="text-gray-800" />
            <VoucherStat label="Disponiveis" value={voucherStats.available} color="text-green-600" />
            <VoucherStat label="Utilizados" value={voucherStats.used} color="text-blue-600" />
            <VoucherStat label="Expirados" value={voucherStats.expired} color="text-red-600" />
          </div>

          {voucherStats.total > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Taxa de uso:{" "}
                <span className="font-semibold text-gray-800">
                  {Math.round((voucherStats.used / voucherStats.total) * 100)}%
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "green" | "blue" | "orange" | "purple";
}) {
  const colorMap = {
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    orange: "bg-orange-50 text-orange-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-[var(--color-text-dark)]">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function VoucherStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <p className={`text-2xl font-bold ${color}`}>{value.toLocaleString("pt-BR")}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
