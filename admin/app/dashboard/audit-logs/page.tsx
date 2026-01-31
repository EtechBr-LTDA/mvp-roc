"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api";
import {
  MagnifyingGlass,
  Eye,
  EyeSlash,
  CaretLeft,
  CaretRight,
  ClipboardText,
  Funnel,
  X,
  Export,
  UserMinus,
  UserCheck,
  Storefront,
  Ticket,
  PencilSimple,
  ArrowsClockwise,
} from "@phosphor-icons/react";

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

const ACTION_CONFIG: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  user_suspended: { label: "Usuario Suspenso", bg: "bg-red-50", text: "text-red-700", icon: <UserMinus size={12} /> },
  user_activated: { label: "Usuario Ativado", bg: "bg-green-50", text: "text-green-700", icon: <UserCheck size={12} /> },
  restaurant_created: { label: "Restaurante Criado", bg: "bg-blue-50", text: "text-blue-700", icon: <Storefront size={12} /> },
  restaurant_updated: { label: "Restaurante Atualizado", bg: "bg-amber-50", text: "text-amber-700", icon: <PencilSimple size={12} /> },
  restaurant_toggled: { label: "Restaurante Alternado", bg: "bg-purple-50", text: "text-purple-700", icon: <ArrowsClockwise size={12} /> },
  voucher_validated: { label: "Voucher Validado", bg: "bg-teal-50", text: "text-teal-700", icon: <Ticket size={12} /> },
};

function ActionBadge({ action }: { action: string }) {
  const config = ACTION_CONFIG[action];
  if (config) {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.icon}
        {config.label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
      {action}
    </span>
  );
}

function truncateDetails(details: any): string {
  if (!details) return "—";
  try {
    const str = typeof details === "string" ? details : JSON.stringify(details);
    return str.length > 100 ? str.substring(0, 100) + "..." : str;
  } catch {
    return "—";
  }
}

function targetTypeLabel(type: string | null | undefined): string {
  if (!type) return "—";
  switch (type) {
    case "user": return "Usuario";
    case "restaurant": return "Restaurante";
    case "voucher": return "Voucher";
    default: return type;
  }
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  // Toggle: exibir todos os dados
  const [showAll, setShowAll] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (actionFilter !== "all") params.action = actionFilter;
      if (search) params.search = search;
      const res = await adminApi.getAuditLogs(params);
      setLogs(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error("Erro ao buscar audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ["Data", "Admin", "Acao", "Tipo", "ID Alvo", "Detalhes"];
    const rows = logs.map((log) => [
      log.created_at ? formatDateTime(log.created_at) : "",
      log.admin?.full_name || log.admin?.email || log.admin_name || "",
      ACTION_CONFIG[log.action]?.label || log.action || "",
      targetTypeLabel(log.target_type),
      log.target_id || "",
      truncateDetails(log.details),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((val: string) => `"${val}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Columns: data + admin + acao + acoes (always)
  // showAll adds: tipo, id alvo, detalhes
  const colCount = showAll ? 6 : 3;

  const actionFilterLabel = ACTION_CONFIG[actionFilter]?.label || actionFilter;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">
            Audit Logs
          </h1>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-semibold text-[var(--color-text-medium)]">
            {total}
          </span>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
            text-[var(--color-text-medium)] bg-white border border-[var(--color-border)]
            hover:bg-slate-50 transition-colors"
        >
          <Export size={18} />
          Exportar CSV
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-soft p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <MagnifyingGlass
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-light)]"
            />
            <input
              type="text"
              placeholder="Buscar por admin ou ID alvo..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[var(--color-border)]
                text-sm text-[var(--color-text-dark)] placeholder:text-[var(--color-text-light)]
                focus:outline-none focus:ring-2 focus:ring-[var(--color-roc-primary)]/20
                focus:border-[var(--color-roc-primary)] transition-colors bg-white"
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-light)] hover:text-[var(--color-text-dark)] transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Action filter */}
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm
              text-[var(--color-text-dark)] bg-white min-w-[200px]
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

          {/* Toggle exibir todos os dados */}
          <button
            onClick={() => setShowAll(!showAll)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium
              transition-colors whitespace-nowrap ${
                showAll
                  ? "border-[var(--color-roc-primary)] text-[var(--color-roc-primary)] bg-blue-50"
                  : "border-[var(--color-border)] text-[var(--color-text-medium)] bg-white hover:bg-slate-50"
              }`}
          >
            {showAll ? <EyeSlash size={18} /> : <Eye size={18} />}
            {showAll ? "Ocultar dados" : "Exibir tudo"}
          </button>
        </div>

        {/* Active filters */}
        {(search || actionFilter !== "all") && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
            <Funnel size={14} className="text-[var(--color-text-light)]" />
            <span className="text-xs text-[var(--color-text-light)]">Filtros:</span>
            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-xs font-medium text-[var(--color-roc-primary)]">
                &quot;{search}&quot;
                <button onClick={() => setSearchInput("")} className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            )}
            {actionFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-xs font-medium text-[var(--color-roc-primary)]">
                {actionFilterLabel}
                <button onClick={() => setActionFilter("all")} className="hover:text-red-500">
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                  Data
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                  Acao
                </th>
                {showAll && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                    Tipo
                  </th>
                )}
                {showAll && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                    ID Alvo
                  </th>
                )}
                {showAll && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                    Detalhes
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-[var(--color-border)]">
                    {Array.from({ length: colCount }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardText size={32} className="text-[var(--color-text-light)]" />
                      <p className="text-sm text-[var(--color-text-light)]">
                        Nenhum registro de auditoria encontrado.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const adminName = log.admin?.full_name || log.admin?.email || log.admin_name || "—";
                  const detailsStr = truncateDetails(log.details);
                  const detailsFull = log.details
                    ? typeof log.details === "string"
                      ? log.details
                      : JSON.stringify(log.details)
                    : "";

                  return (
                    <tr
                      key={log.id}
                      className="border-b border-[var(--color-border)] hover:bg-slate-50 transition-colors"
                    >
                      {/* Data */}
                      <td className="px-4 py-3 text-sm text-[var(--color-text-medium)] whitespace-nowrap">
                        {formatDateTime(log.created_at)}
                      </td>
                      {/* Admin */}
                      <td className="px-4 py-3 text-sm text-[var(--color-text-dark)]">
                        {adminName}
                      </td>
                      {/* Acao */}
                      <td className="px-4 py-3">
                        <ActionBadge action={log.action} />
                      </td>
                      {/* Tipo */}
                      {showAll && (
                        <td className="px-4 py-3 text-sm text-[var(--color-text-dark)]">
                          {targetTypeLabel(log.target_type)}
                        </td>
                      )}
                      {/* ID Alvo */}
                      {showAll && (
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs text-[var(--color-text-medium)]">
                            {log.target_id || "—"}
                          </span>
                        </td>
                      )}
                      {/* Detalhes */}
                      {showAll && (
                        <td className="px-4 py-3 max-w-xs">
                          <span
                            className="text-xs text-[var(--color-text-medium)] block truncate"
                            title={detailsFull}
                          >
                            {detailsStr}
                          </span>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)]">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                text-[var(--color-text-medium)] hover:bg-slate-100 transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CaretLeft size={16} />
              Anterior
            </button>
            <span className="text-sm text-[var(--color-text-medium)]">
              Pagina{" "}
              <span className="font-semibold text-[var(--color-text-dark)]">{page}</span>
              {" "}de{" "}
              <span className="font-semibold text-[var(--color-text-dark)]">{totalPages}</span>
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                text-[var(--color-text-medium)] hover:bg-slate-100 transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Proximo
              <CaretRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
