"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { adminApi } from "../../lib/api";
import { StatusBadge } from "../../components/StatusBadge";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import {
  MagnifyingGlass,
  DotsThree,
  Eye,
  UserMinus,
  UserCheck,
  CaretLeft,
  CaretRight,
  Users,
} from "@phosphor-icons/react";

function maskCpf(cpf: string | null | undefined): string {
  if (!cpf) return "—";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.***.***-${digits.slice(9)}`;
}

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Action menu
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmUser, setConfirmUser] = useState<any>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await adminApi.getUsers(params);
      setUsers(res.data);
      setTotal(res.total);
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

  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleToggleSuspend = (user: any) => {
    setConfirmUser(user);
    setConfirmOpen(true);
    setOpenMenuId(null);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">
            Usuarios
          </h1>
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-xs font-semibold text-[var(--color-text-medium)]">
            {total}
          </span>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <MagnifyingGlass
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-light)]"
          />
          <input
            type="text"
            placeholder="Buscar por nome, email ou CPF..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[var(--color-border)]
              text-sm text-[var(--color-text-dark)] placeholder:text-[var(--color-text-light)]
              focus:outline-none focus:ring-2 focus:ring-[var(--color-roc-primary)]/20
              focus:border-[var(--color-roc-primary)] transition-colors bg-white"
          />
        </form>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                  CPF
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                  Cidade
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                  Criado em
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
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-100 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users size={32} className="text-[var(--color-text-light)]" />
                      <p className="text-sm text-[var(--color-text-light)]">
                        Nenhum usuario encontrado.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-[var(--color-border)] hover:bg-slate-50 transition-colors"
                  >
                    {/* Usuario: nome + email */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <Link
                          href={`/dashboard/users/${user.id}`}
                          className="text-sm font-medium text-[var(--color-text-dark)] hover:text-[var(--color-roc-primary)] transition-colors"
                        >
                          {user.full_name || "—"}
                        </Link>
                        <span className="text-xs text-[var(--color-text-medium)]">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    {/* CPF mascarado */}
                    <td className="px-4 py-3 text-sm text-[var(--color-text-dark)] font-mono">
                      {maskCpf(user.cpf)}
                    </td>
                    {/* Cidade */}
                    <td className="px-4 py-3 text-sm text-[var(--color-text-dark)]">
                      {user.city || "—"}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={user.suspended_at ? "Suspenso" : "Ativo"}
                        type="user"
                      />
                    </td>
                    {/* Criado em */}
                    <td className="px-4 py-3 text-sm text-[var(--color-text-medium)]">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    {/* Acoes (menu de 3 pontos) */}
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === user.id ? null : user.id);
                          }}
                          className="p-1.5 rounded-lg text-[var(--color-text-medium)] hover:bg-slate-100 transition-colors"
                        >
                          <DotsThree size={20} weight="bold" />
                        </button>
                        {openMenuId === user.id && (
                          <div
                            className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-medium border border-[var(--color-border)] py-1 z-20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link
                              href={`/dashboard/users/${user.id}`}
                              className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--color-text-dark)]
                                hover:bg-slate-50 transition-colors"
                            >
                              <Eye size={16} className="text-[var(--color-text-medium)]" />
                              Ver detalhes
                            </Link>
                            <button
                              onClick={() => handleToggleSuspend(user)}
                              className={`flex items-center gap-2.5 px-3 py-2 text-sm w-full text-left
                                hover:bg-slate-50 transition-colors ${
                                  user.suspended_at ? "text-green-700" : "text-red-600"
                                }`}
                            >
                              {user.suspended_at ? (
                                <>
                                  <UserCheck size={16} />
                                  Reativar
                                </>
                              ) : (
                                <>
                                  <UserMinus size={16} />
                                  Suspender
                                </>
                              )}
                            </button>
                          </div>
                        )}
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
          setConfirmUser(null);
        }}
        onConfirm={confirmToggleSuspend}
        title={
          confirmUser?.suspended_at ? "Ativar Usuario" : "Suspender Usuario"
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
