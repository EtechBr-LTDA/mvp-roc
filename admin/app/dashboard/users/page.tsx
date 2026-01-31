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
  UserMinus,
  UserCheck,
  CaretLeft,
  CaretRight,
  Users,
  Funnel,
  X,
} from "@phosphor-icons/react";

function formatCpf(cpf: string | null | undefined, full: boolean): string {
  if (!cpf) return "—";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  if (full) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
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

  // Toggle: exibir todos os dados (CPF completo, cidade, status, criado em)
  const [showAll, setShowAll] = useState(false);

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

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

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

  const colCount = showAll ? 6 : 2; // usuario + acoes (+ cpf, cidade, status, criado em quando showAll)

  return (
    <div className="space-y-5">
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
              placeholder="Buscar por nome, email ou CPF..."
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
            <option value="suspended">Suspensos</option>
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
                {statusFilter === "active" ? "Ativos" : "Suspensos"}
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
                  Usuario
                </th>
                {showAll && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                    CPF
                  </th>
                )}
                {showAll && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                    Cidade
                  </th>
                )}
                {showAll && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                    Status
                  </th>
                )}
                {showAll && (
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[var(--color-text-medium)] uppercase tracking-wider">
                    Criado em
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={colCount} className="px-4 py-12 text-center">
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
                    {/* CPF - completo quando showAll */}
                    {showAll && (
                      <td className="px-4 py-3 text-sm text-[var(--color-text-dark)] font-mono">
                        {formatCpf(user.cpf, true)}
                      </td>
                    )}
                    {/* Cidade */}
                    {showAll && (
                      <td className="px-4 py-3 text-sm text-[var(--color-text-dark)]">
                        {user.city || "—"}
                      </td>
                    )}
                    {/* Status */}
                    {showAll && (
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={user.suspended_at ? "Suspenso" : "Ativo"}
                          type="user"
                        />
                      </td>
                    )}
                    {/* Criado em */}
                    {showAll && (
                      <td className="px-4 py-3 text-sm text-[var(--color-text-medium)]">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                    )}
                    {/* Acoes diretas */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/users/${user.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                            text-[var(--color-roc-primary)] bg-blue-50 hover:bg-blue-100
                            transition-colors"
                        >
                          <Eye size={14} />
                          Gerenciar
                        </Link>
                        <button
                          onClick={() => handleToggleSuspend(user)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                            transition-colors ${
                              user.suspended_at
                                ? "text-green-700 bg-green-50 hover:bg-green-100"
                                : "text-red-600 bg-red-50 hover:bg-red-100"
                            }`}
                        >
                          {user.suspended_at ? (
                            <>
                              <UserCheck size={14} />
                              Ativar
                            </>
                          ) : (
                            <>
                              <UserMinus size={14} />
                              Suspender
                            </>
                          )}
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
