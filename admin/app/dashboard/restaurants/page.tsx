"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "@phosphor-icons/react";
import { adminApi } from "../../lib/api";
import { DataTable } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { ConfirmDialog } from "../../components/ConfirmDialog";

export default function RestaurantsPage() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRestaurant, setConfirmRestaurant] = useState<any>(null);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page };
      if (search) params.search = search;
      if (activeFilter !== "all") params.active = activeFilter;
      const res = await adminApi.getRestaurants(params);
      setRestaurants(res.data);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error("Erro ao buscar restaurantes:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, activeFilter]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleSearch = (term: string) => {
    setSearch(term);
    setPage(1);
  };

  const handleActiveFilterChange = (value: string) => {
    setActiveFilter(value as "all" | "active" | "inactive");
    setPage(1);
  };

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

  const columns = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "name",
      label: "Nome",
    },
    {
      key: "city",
      label: "Cidade",
    },
    {
      key: "category",
      label: "Categoria",
      render: (value: any) => value || "—",
    },
    {
      key: "discount_label",
      label: "Desconto",
    },
    {
      key: "active",
      label: "Status",
      render: (value: any) => (
        <StatusBadge
          status={value ? "Ativo" : "Inativo"}
          type="restaurant"
        />
      ),
    },
    {
      key: "actions",
      label: "Acoes",
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/restaurants/${row.id}/edit`}
            className="px-3 py-1.5 rounded-lg text-xs font-medium
              text-[var(--color-roc-primary)] bg-blue-50 hover:bg-blue-100
              transition-colors"
          >
            Editar
          </Link>
          <button
            onClick={() => handleToggleActive(row)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              row.active
                ? "text-red-700 bg-red-50 hover:bg-red-100"
                : "text-green-700 bg-green-50 hover:bg-green-100"
            }`}
          >
            {row.active ? "Desativar" : "Ativar"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">
          Restaurantes
        </h1>
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={activeFilter}
          onChange={(e) => handleActiveFilterChange(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm
            text-[var(--color-text-dark)] bg-white
            focus:outline-none focus:ring-2 focus:ring-[var(--color-roc-primary)]/20
            focus:border-[var(--color-roc-primary)] transition-colors"
        >
          <option value="all">Todos os status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={restaurants}
        isLoading={loading}
        emptyMessage="Nenhum restaurante encontrado."
        onSearch={handleSearch}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
      />

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
