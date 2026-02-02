"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  UserMinus,
  GenderIntersex,
  CalendarBlank,
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

const genderLabels: Record<string, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  outro: "Outro",
  nao_informado: "Nao informado",
};

const genderColors: Record<string, string> = {
  masculino: "bg-blue-500",
  feminino: "bg-pink-500",
  outro: "bg-purple-500",
  nao_informado: "bg-gray-400",
};

export default function StatsUsersPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("30d");

  const loadStats = async (p: Period) => {
    setLoading(true);
    try {
      const dates = getPeriodDates(p);
      const data = await adminApi.getUserStats(dates);
      setStats(data);
    } catch (err: any) {
      console.error("Erro ao carregar stats:", err);
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

  const totalUsers = stats?.total_users || 0;
  const newUsers = stats?.new_users || 0;
  const activeUsers = stats?.active_users || 0;
  const suspendedUsers = stats?.suspended_users || 0;
  const genderDist: { gender: string; count: number }[] = stats?.gender_distribution || [];
  const ageRanges: { range: string; count: number }[] = stats?.age_ranges || [];
  const averageAge = stats?.average_age;

  const genderTotal = genderDist.reduce((s, g) => s + g.count, 0) || 1;

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-text-dark)]">
          Estatisticas de Usuarios
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

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Users size={24} />}
          label="Total de Usuarios"
          value={totalUsers.toLocaleString("pt-BR")}
          color="blue"
        />
        <MetricCard
          icon={<UserPlus size={24} />}
          label="Novos no Periodo"
          value={newUsers.toLocaleString("pt-BR")}
          color="green"
        />
        <MetricCard
          icon={<UserCheck size={24} />}
          label="Com Passe Ativo"
          value={activeUsers.toLocaleString("pt-BR")}
          color="purple"
        />
        <MetricCard
          icon={<UserMinus size={24} />}
          label="Suspensos"
          value={suspendedUsers.toLocaleString("pt-BR")}
          color="red"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender distribution */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <GenderIntersex size={20} className="text-purple-500" />
            <h3 className="font-semibold text-[var(--color-text-dark)]">Distribuicao por Genero</h3>
          </div>

          {genderDist.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Nenhum dado de genero registrado
            </p>
          ) : (
            <div className="space-y-3">
              {genderDist.map((g) => {
                const pct = Math.round((g.count / genderTotal) * 100);
                const color = genderColors[g.gender] || "bg-gray-400";
                return (
                  <div key={g.gender}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">
                        {genderLabels[g.gender] || g.gender}
                      </span>
                      <span className="font-medium text-gray-800">
                        {g.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${color}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Age ranges */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarBlank size={20} className="text-orange-500" />
            <h3 className="font-semibold text-[var(--color-text-dark)]">Faixa Etaria</h3>
          </div>

          {ageRanges.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Nenhum dado de idade registrado
            </p>
          ) : (
            <div className="space-y-3">
              {ageRanges.filter((a) => a.range !== "nao_informado").map((a) => {
                const maxCount = Math.max(...ageRanges.map((r) => r.count), 1);
                const pct = Math.round((a.count / maxCount) * 100);
                return (
                  <div key={a.range}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{a.range} anos</span>
                      <span className="font-medium text-gray-800">{a.count}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-orange-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {ageRanges.find((a) => a.range === "nao_informado") && (
                <p className="text-xs text-gray-400 mt-2">
                  {ageRanges.find((a) => a.range === "nao_informado")?.count || 0} usuarios sem data de nascimento
                </p>
              )}
            </div>
          )}

          {averageAge && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Idade media: <span className="font-semibold text-gray-800">{averageAge} anos</span>
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
  color: "blue" | "green" | "purple" | "red";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
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
