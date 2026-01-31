"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { adminApi } from "../../lib/api";
import { StatusBadge } from "../../components/StatusBadge";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import {
  MagnifyingGlass,
  Eye,
  EyeSlash,
  CaretLeft,
  CaretRight,
  Ticket,
  Funnel,
  X,
  Export,
  Copy,
  CheckCircle,
  Lightning,
  Check,
} from "@phosphor-icons/react";

function formatDate(value: string | null | undefined, withTime = false): string {
  if (!value) return "—";
  const opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };
  if (withTime) {
    opts.hour = "2-digit";
    opts.minute = "2-digit";
  }
  return new Date(value).toLocaleDateString("pt-BR", opts);
}

function statusLabel(status: string): string {
  switch (status) {
    case "available":
      return "Disponivel";
    case "used":
      return "Usado";
    case "expired":
      return "Expirado";
    default:
      return status;
  }
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Toggle: exibir todos os dados
  const [showAll, setShowAll] = useState(false);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmVoucher, setConfirmVoucher] = useState<any>(null);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await adminApi.getVouchers(params);
      setVouchers(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error("Erro ao buscar vouchers:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleValidate = (voucher: any) => {
    setConfirmVoucher(voucher);
    setConfirmOpen(true);
  };

  const confirmValidate = async () => {
    if (!confirmVoucher) return;
    try {
      await adminApi.manualValidateVoucher(confirmVoucher.id);
      fetchVouchers();
    } catch (err) {
      console.error("Erro ao validar voucher:", err);
    }
  };

  const handleExportCSV = () => {
    if (vouchers.length === 0) return;
    const headers = [
      "Codigo",
      "Usuario",
      "Restaurante",
      "Oferta",
      "Status",
      "Criado em",
      "Usado em",
      "Expira em",
    ];
    const rows = vouchers.map((v) => [
      v.code || "",
      v.profile?.full_name || v.user_name || "",
      v.restaurant?.name || v.restaurant_name || "",
      v.restaurant?.discount_label || v.discount_label || "",
      statusLabel(v.status || "available"),
      v.created_at ? formatDate(v.created_at) : "",
      v.used_at ? formatDate(v.used_at, true) : "",
      v.expires_at ? formatDate(v.expires_at) : "",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((val: string) => `"${val}"`).join(","))
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vouchers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Columns: codigo + usuario + restaurante + status + acoes (always)
  // showAll adds: oferta, criado em, usado em, expira em
  const colCount = showAll ? 9 : 5;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">
            Vouchers
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
              placeholder="Buscar por codigo, usuario ou restaurante..."
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

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm
              text-[var(--color-text-dark)] bg-white min-w-[160px]
              focus:outline-none focus:ring-2 focus:ring-[var(--color-roc-primary)]/20
              focus:border-[var(--color-roc-primary)] transition-colors"
          >
            <option value="all">Todos os status</option>
            <option value="available">Disponiveis</option>
            <option value="used">Usados</option>
            <option value="expired">Expirados</option>
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
        {(search || statusFilter !== "all") && (
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
            {statusFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-xs font-medium text-[var(--color-roc-primary)]">
                {statusFilter === "available"
                  ? "Disponiveis"
                  : statusFilter === "used"
                  ? "Usados"
                  : "Expirados"}
                <button onClick={() => setStatusFilter("all")} className="hover:text-red-500">
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
                  Codigo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                  Restaurante
                </th>
                {showAll && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                    Oferta
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                  Status
                </th>
                {showAll && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                    Criado em
                  </th>
                )}
                {showAll && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                    Usado em
                  </th>
                )}
                {showAll && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                    Expira em
                  </th>
                )}
                <th className="px-4 py-3 text-right text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                  Acoes
                </th>
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
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Ticket size={32} className="text-[var(--color-text-light)]" />
                      <p className="text-sm text-[var(--color-text-light)]">
                        Nenhum voucher encontrado.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                vouchers.map((voucher) => {
                  const userName = voucher.profile?.full_name || voucher.user_name || "—";
                  const userId = voucher.user_id || voucher.profile?.id;
                  const restaurantName = voucher.restaurant?.name || voucher.restaurant_name || "—";
                  const restaurantId = voucher.restaurant_id || voucher.restaurant?.id;
                  const oferta = voucher.restaurant?.discount_label || voucher.discount_label || "";
                  const isAvailable = voucher.status === "available" || voucher.status === "Disponivel";

                  return (
                    <tr
                      key={voucher.id}
                      className="border-b border-[var(--color-border)] hover:bg-slate-50 transition-colors"
                    >
                      {/* Codigo com botao copiar */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-[var(--color-text-dark)]">
                            {voucher.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(voucher.code, voucher.id)}
                            className="text-[var(--color-text-light)] hover:text-[var(--color-roc-primary)] transition-colors"
                            title="Copiar codigo"
                          >
                            {copiedId === voucher.id ? (
                              <Check size={14} className="text-green-600" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                      {/* Usuario clicavel */}
                      <td className="px-4 py-3">
                        {userId ? (
                          <Link
                            href={`/dashboard/users/${userId}`}
                            className="text-sm text-[var(--color-text-dark)] hover:text-[var(--color-roc-primary)] transition-colors"
                          >
                            {userName}
                          </Link>
                        ) : (
                          <span className="text-sm text-[var(--color-text-dark)]">{userName}</span>
                        )}
                      </td>
                      {/* Restaurante clicavel */}
                      <td className="px-4 py-3">
                        {restaurantId ? (
                          <Link
                            href={`/dashboard/restaurants/${restaurantId}/edit`}
                            className="text-sm text-[var(--color-text-dark)] hover:text-[var(--color-roc-primary)] transition-colors"
                          >
                            {restaurantName}
                          </Link>
                        ) : (
                          <span className="text-sm text-[var(--color-text-dark)]">{restaurantName}</span>
                        )}
                      </td>
                      {/* Oferta */}
                      {showAll && (
                        <td className="px-4 py-3">
                          {oferta ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-xs font-medium text-amber-700">
                              <Lightning size={12} />
                              {oferta}
                            </span>
                          ) : (
                            <span className="text-sm text-[var(--color-text-light)]">—</span>
                          )}
                        </td>
                      )}
                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={statusLabel(voucher.status || "available")}
                          type="voucher"
                        />
                      </td>
                      {/* Criado em */}
                      {showAll && (
                        <td className="px-4 py-3 text-sm text-[var(--color-text-medium)]">
                          {formatDate(voucher.created_at)}
                        </td>
                      )}
                      {/* Usado em */}
                      {showAll && (
                        <td className="px-4 py-3 text-sm text-[var(--color-text-medium)]">
                          {formatDate(voucher.used_at, true)}
                        </td>
                      )}
                      {/* Expira em */}
                      {showAll && (
                        <td className="px-4 py-3 text-sm text-[var(--color-text-medium)]">
                          {formatDate(voucher.expires_at)}
                        </td>
                      )}
                      {/* Acoes */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {isAvailable && (
                            <button
                              onClick={() => handleValidate(voucher)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                text-green-700 bg-green-50 hover:bg-green-100
                                transition-colors"
                            >
                              <CheckCircle size={14} />
                              Validar
                            </button>
                          )}
                        </div>
                      </td>
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

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setConfirmVoucher(null);
        }}
        onConfirm={confirmValidate}
        title="Validar Voucher"
        message={`Deseja validar manualmente o voucher "${confirmVoucher?.code}"? Esta acao marcara o voucher como utilizado.`}
        confirmLabel="Validar"
        variant="primary"
      />
    </div>
  );
}
