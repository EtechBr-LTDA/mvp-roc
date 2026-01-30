"use client";

import { useEffect, useState, useCallback } from "react";
import { adminApi } from "../../lib/api";
import { DataTable } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { ConfirmDialog } from "../../components/ConfirmDialog";

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "available" | "used" | "expired">("all");

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmVoucher, setConfirmVoucher] = useState<any>(null);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await adminApi.getVouchers(params);
      setVouchers(res.data);
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

  const handleSearch = (term: string) => {
    setSearch(term);
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as "all" | "available" | "used" | "expired");
    setPage(1);
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

  const columns = [
    {
      key: "code",
      label: "Codigo",
      render: (value: any) => (
        <span className="font-mono text-sm">{value}</span>
      ),
    },
    {
      key: "profile",
      label: "Usuario",
      render: (_: any, row: any) =>
        row.profile?.full_name || row.user_name || "—",
    },
    {
      key: "restaurant",
      label: "Restaurante",
      render: (_: any, row: any) =>
        row.restaurant?.name || row.restaurant_name || "—",
    },
    {
      key: "status",
      label: "Status",
      render: (value: any) => (
        <StatusBadge status={value || "available"} type="voucher" />
      ),
    },
    {
      key: "created_at",
      label: "Criado em",
      render: (value: any) =>
        value
          ? new Date(value).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "—",
    },
    {
      key: "used_at",
      label: "Usado em",
      render: (value: any) =>
        value
          ? new Date(value).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—",
    },
    {
      key: "actions",
      label: "Acoes",
      render: (_: any, row: any) => {
        const isAvailable =
          row.status === "available" || row.status === "Disponivel";
        if (!isAvailable) {
          return (
            <span className="text-xs text-[var(--color-text-light)]">—</span>
          );
        }
        return (
          <button
            onClick={() => handleValidate(row)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium
              text-[var(--color-roc-primary)] bg-blue-50 hover:bg-blue-100
              transition-colors"
          >
            Validar
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">
          Vouchers
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilterChange(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm
            text-[var(--color-text-dark)] bg-white
            focus:outline-none focus:ring-2 focus:ring-[var(--color-roc-primary)]/20
            focus:border-[var(--color-roc-primary)] transition-colors"
        >
          <option value="all">Todos os status</option>
          <option value="available">Disponiveis</option>
          <option value="used">Usados</option>
          <option value="expired">Expirados</option>
        </select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={vouchers}
        isLoading={loading}
        emptyMessage="Nenhum voucher encontrado."
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
