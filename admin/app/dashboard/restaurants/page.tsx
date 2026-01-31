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
  Plus,
  CaretLeft,
  CaretRight,
  Storefront,
  Funnel,
  X,
  Export,
  Power,
  Lightning,
} from "@phosphor-icons/react";

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Toggle: exibir todos os dados (categoria, desconto, cidade, etc)
  const [showAll, setShowAll] = useState(false);

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRestaurant, setConfirmRestaurant] = useState<any>(null);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter !== "all") params.active = statusFilter;
      const res = await adminApi.getRestaurants(params);
      setRestaurants(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error("Erro ao buscar restaurantes:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleToggleActive = (restaurant: any) => {
    setConfirmRestaurant(restaurant);
    setConfirmOpen(true);
  };

  const confirmToggleActive = async () => {
    if (!confirmRestaurant) return;
    try {
      await adminApi.toggleRestaurant(confirmRestaurant.id);
      fetchRestaurants();
    } catch (err) {
      console.error("Erro ao alterar status do restaurante:", err);
    }
  };

  const handleExportCSV = () => {
    if (restaurants.length === 0) return;
    const headers = ["ID", "Nome", "Cidade", "Categoria", "Oferta Principal", "Status"];
    const rows = restaurants.map((r) => [
      r.id,
      r.name,
      r.city || "",
      r.category || "",
      r.discount_label || "",
      r.active ? "Ativo" : "Inativo",
    ]);
    const csv = [headers, ...rows].map((row) => row.map((v: any) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `restaurantes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const colCount = showAll ? 7 : 3; // nome + status + acoes (+ id, cidade, categoria, oferta quando showAll)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">
            Restaurantes
          </h1>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-semibold text-[var(--color-text-medium)]">
            {total}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
              text-[var(--color-text-medium)] bg-white border border-[var(--color-border)]
              hover:bg-slate-50 transition-colors"
          >
            <Export size={18} />
            Exportar CSV
          </button>
          <Link
            href="/dashboard/restaurants/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
              text-white bg-[var(--color-roc-primary)] hover:bg-[var(--color-roc-primary-dark)]
              transition-colors shadow-sm"
          >
            <Plus size={18} weight="bold" />
            Novo Restaurante
          </Link>
        </div>
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
              placeholder="Buscar por nome, cidade ou categoria..."
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
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
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
                {statusFilter === "active" ? "Ativos" : "Inativos"}
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
                {showAll && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                    ID
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                  Restaurante
                </th>
                {showAll && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                    Cidade
                  </th>
                )}
                {showAll && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                    Categoria
                  </th>
                )}
                {showAll && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                    Oferta Principal
                  </th>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                  Status
                </th>
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
              ) : restaurants.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Storefront size={32} className="text-[var(--color-text-light)]" />
                      <p className="text-sm text-[var(--color-text-light)]">
                        Nenhum restaurante encontrado.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                restaurants.map((restaurant) => (
                  <tr
                    key={restaurant.id}
                    className="border-b border-[var(--color-border)] hover:bg-slate-50 transition-colors"
                  >
                    {/* ID */}
                    {showAll && (
                      <td className="px-4 py-3 text-sm text-[var(--color-text-medium)] font-mono">
                        #{restaurant.id}
                      </td>
                    )}
                    {/* Restaurante: nome + cidade/categoria inline */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <Link
                          href={`/dashboard/restaurants/${restaurant.id}/edit`}
                          className="text-sm font-medium text-[var(--color-text-dark)] hover:text-[var(--color-roc-primary)] transition-colors"
                        >
                          {restaurant.name}
                        </Link>
                        {!showAll && (
                          <span className="text-xs text-[var(--color-text-medium)]">
                            {[restaurant.city, restaurant.category].filter(Boolean).join(" · ") || "—"}
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Cidade */}
                    {showAll && (
                      <td className="px-4 py-3 text-sm text-[var(--color-text-dark)]">
                        {restaurant.city || "—"}
                      </td>
                    )}
                    {/* Categoria */}
                    {showAll && (
                      <td className="px-4 py-3 text-sm text-[var(--color-text-dark)]">
                        {restaurant.category || "—"}
                      </td>
                    )}
                    {/* Oferta Principal */}
                    {showAll && (
                      <td className="px-4 py-3">
                        {restaurant.discount_label ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-xs font-medium text-amber-700">
                            <Lightning size={12} />
                            {restaurant.discount_label}
                          </span>
                        ) : (
                          <span className="text-sm text-[var(--color-text-light)]">—</span>
                        )}
                      </td>
                    )}
                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={restaurant.active ? "Ativo" : "Inativo"}
                        type="restaurant"
                      />
                    </td>
                    {/* Acoes diretas */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/restaurants/${restaurant.id}/edit`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                            text-[var(--color-roc-primary)] bg-blue-50 hover:bg-blue-100
                            transition-colors"
                        >
                          <Eye size={14} />
                          Gerenciar
                        </Link>
                        <button
                          onClick={() => handleToggleActive(restaurant)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                            transition-colors ${
                              restaurant.active
                                ? "text-red-600 bg-red-50 hover:bg-red-100"
                                : "text-green-700 bg-green-50 hover:bg-green-100"
                            }`}
                        >
                          <Power size={14} />
                          {restaurant.active ? "Desativar" : "Ativar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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
          setConfirmRestaurant(null);
        }}
        onConfirm={confirmToggleActive}
        title={
          confirmRestaurant?.active
            ? "Desativar Restaurante"
            : "Ativar Restaurante"
        }
        message={
          confirmRestaurant?.active
            ? `Deseja desativar o restaurante "${confirmRestaurant?.name}"? Ele nao aparecera mais para os usuarios.`
            : `Deseja ativar o restaurante "${confirmRestaurant?.name}"?`
        }
        confirmLabel={confirmRestaurant?.active ? "Desativar" : "Ativar"}
        variant={confirmRestaurant?.active ? "danger" : "primary"}
      />
    </div>
  );
}
