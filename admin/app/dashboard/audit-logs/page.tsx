"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api";
import { DataTable } from "../../components/DataTable";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>("all");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page };
      if (actionFilter !== "all") params.action = actionFilter;
      const res = await adminApi.getAuditLogs(params);
      setLogs(res.data);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error("Erro ao buscar audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleActionFilterChange = (value: string) => {
    setActionFilter(value);
    setPage(1);
  };

  const truncateDetails = (details: any): string => {
    if (!details) return "—";
    try {
      const str =
        typeof details === "string" ? details : JSON.stringify(details);
      return str.length > 80 ? str.substring(0, 80) + "..." : str;
    } catch {
      return "—";
    }
  };

  const columns = [
    {
      key: "created_at",
      label: "Data",
      render: (value: any) =>
        value
          ? new Date(value).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : "—",
    },
    {
      key: "admin",
      label: "Admin",
      render: (_: any, row: any) =>
        row.admin?.full_name || row.admin?.email || row.admin_name || "—",
    },
    {
      key: "action",
      label: "Acao",
      render: (value: any) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
          {value}
        </span>
      ),
    },
    {
      key: "target_type",
      label: "Tipo",
      render: (value: any) => value || "—",
    },
    {
      key: "target_id",
      label: "ID Alvo",
      render: (value: any) => (
        <span className="font-mono text-xs">{value || "—"}</span>
      ),
    },
    {
      key: "details",
      label: "Detalhes",
      render: (value: any) => (
        <span
          className="text-xs text-[var(--color-text-medium)] max-w-xs block truncate"
          title={
            value
              ? typeof value === "string"
                ? value
                : JSON.stringify(value)
              : ""
          }
        >
          {truncateDetails(value)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">
          Audit Logs
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={actionFilter}
          onChange={(e) => handleActionFilterChange(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm
            text-[var(--color-text-dark)] bg-white
            focus:outline-none focus:ring-2 focus:ring-[var(--color-roc-primary)]/20
            focus:border-[var(--color-roc-primary)] transition-colors"
        >
          <option value="all">Todas as acoes</option>
          <option value="user_suspended">Usuario Suspenso</option>
          <option value="user_activated">Usuario Ativado</option>
          <option value="restaurant_created">Restaurante Criado</option>
          <option value="restaurant_updated">Restaurante Atualizado</option>
          <option value="restaurant_toggled">Restaurante Alternado</option>
          <option value="voucher_validated">Voucher Validado</option>
        </select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={logs}
        isLoading={loading}
        emptyMessage="Nenhum registro de auditoria encontrado."
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
