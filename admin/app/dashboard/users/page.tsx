"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { adminApi } from "../../lib/api";
import { DataTable } from "../../components/DataTable";
import { StatusBadge } from "../../components/StatusBadge";
import { ConfirmDialog } from "../../components/ConfirmDialog";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmUser, setConfirmUser] = useState<any>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await adminApi.getUsers(params);
      setUsers(res.data);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error("Erro ao buscar usuarios:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (term: string) => {
    setSearch(term);
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as "all" | "active" | "suspended");
    setPage(1);
  };

  const handleToggleSuspend = (user: any) => {
    setConfirmUser(user);
    setConfirmOpen(true);
  };

  const confirmToggleSuspend = async () => {
    if (!confirmUser) return;
    try {
      if (confirmUser.suspended_at) {
        await adminApi.activateUser(confirmUser.id);
      } else {
        await adminApi.suspendUser(confirmUser.id);
      }
      fetchUsers();
    } catch (err) {
      console.error("Erro ao alterar status do usuario:", err);
    }
  };

  const columns = [
    {
      key: "full_name",
      label: "Nome",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "cpf",
      label: "CPF",
    },
    {
      key: "city",
      label: "Cidade",
    },
    {
      key: "status",
      label: "Status",
      render: (_: any, row: any) => (
        <StatusBadge
          status={row.suspended_at ? "Suspenso" : "Ativo"}
          type="user"
        />
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
      key: "actions",
      label: "Acoes",
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/users/${row.id}`}
            className="px-3 py-1.5 rounded-lg text-xs font-medium
              text-[var(--color-roc-primary)] bg-blue-50 hover:bg-blue-100
              transition-colors"
          >
            Ver
          </Link>
          <button
            onClick={() => handleToggleSuspend(row)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              row.suspended_at
                ? "text-green-700 bg-green-50 hover:bg-green-100"
                : "text-red-700 bg-red-50 hover:bg-red-100"
            }`}
          >
            {row.suspended_at ? "Ativar" : "Suspender"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">
          Usuarios
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
          <option value="active">Ativos</option>
          <option value="suspended">Suspensos</option>
        </select>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={users}
        isLoading={loading}
        emptyMessage="Nenhum usuario encontrado."
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
          setConfirmUser(null);
        }}
        onConfirm={confirmToggleSuspend}
        title={
          confirmUser?.suspended_at
            ? "Ativar Usuario"
            : "Suspender Usuario"
        }
        message={
          confirmUser?.suspended_at
            ? `Deseja reativar o usuario "${confirmUser?.full_name || confirmUser?.email}"?`
            : `Deseja suspender o usuario "${confirmUser?.full_name || confirmUser?.email}"? Ele perdera acesso ao sistema.`
        }
        confirmLabel={confirmUser?.suspended_at ? "Ativar" : "Suspender"}
        variant={confirmUser?.suspended_at ? "primary" : "danger"}
      />
    </div>
  );
}
