"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react";
import { adminApi } from "../../../lib/api";
import { StatusBadge } from "../../../components/StatusBadge";
import { ConfirmDialog } from "../../../components/ConfirmDialog";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Confirm dialog
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUserDetail(id);
      setUser(data);
    } catch (err: any) {
      console.error("Erro ao buscar usuario:", err);
      setError(err?.message || "Erro ao carregar usuario.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  const handleToggleSuspend = async () => {
    if (!user) return;
    try {
      if (user.suspended_at) {
        await adminApi.activateUser(id);
      } else {
        await adminApi.suspendUser(id);
      }
      fetchUser();
    } catch (err) {
      console.error("Erro ao alterar status:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse" />
        <div className="h-64 bg-white rounded-xl shadow-soft animate-pulse" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/users"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-medium)] hover:text-[var(--color-text-dark)] transition-colors"
        >
          <ArrowLeft size={18} />
          Voltar para Usuarios
        </Link>
        <div className="bg-white rounded-xl shadow-soft p-8 text-center">
          <p className="text-sm text-red-600">{error || "Usuario nao encontrado."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/dashboard/users"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-medium)] hover:text-[var(--color-text-dark)] transition-colors"
      >
        <ArrowLeft size={18} />
        Voltar para Usuarios
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">
          {user.full_name || user.email}
        </h1>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-dark)] mb-4">
          Informacoes do Usuario
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-[var(--color-text-medium)] uppercase tracking-wider mb-1">
              Nome Completo
            </p>
            <p className="text-sm text-[var(--color-text-dark)]">
              {user.full_name || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--color-text-medium)] uppercase tracking-wider mb-1">
              Email
            </p>
            <p className="text-sm text-[var(--color-text-dark)]">
              {user.email || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--color-text-medium)] uppercase tracking-wider mb-1">
              CPF
            </p>
            <p className="text-sm text-[var(--color-text-dark)]">
              {user.cpf || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--color-text-medium)] uppercase tracking-wider mb-1">
              Telefone
            </p>
            <p className="text-sm text-[var(--color-text-dark)]">
              {user.phone || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--color-text-medium)] uppercase tracking-wider mb-1">
              Cidade
            </p>
            <p className="text-sm text-[var(--color-text-dark)]">
              {user.city || user.address_city || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--color-text-medium)] uppercase tracking-wider mb-1">
              Estado
            </p>
            <p className="text-sm text-[var(--color-text-dark)]">
              {user.state || user.address_state || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--color-text-medium)] uppercase tracking-wider mb-1">
              Endereco
            </p>
            <p className="text-sm text-[var(--color-text-dark)]">
              {user.address_street
                ? `${user.address_street}${user.address_number ? `, ${user.address_number}` : ""}${user.address_complement ? ` - ${user.address_complement}` : ""}`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--color-text-medium)] uppercase tracking-wider mb-1">
              CEP
            </p>
            <p className="text-sm text-[var(--color-text-dark)]">
              {user.address_zip || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[var(--color-text-medium)] uppercase tracking-wider mb-1">
              Criado em
            </p>
            <p className="text-sm text-[var(--color-text-dark)]">
              {user.created_at
                ? new Date(user.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Pass Status & Suspension */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pass Status */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-dark)] mb-3">
            Status do Passe
          </h2>
          <div className="flex items-center gap-3">
            <StatusBadge
              status={user.pass_active ? "Ativo" : "Inativo"}
              type="user"
            />
            {user.pass_expires_at && (
              <span className="text-xs text-[var(--color-text-medium)]">
                Expira em:{" "}
                {new Date(user.pass_expires_at).toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
        </div>

        {/* Suspension Status */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-dark)] mb-3">
            Status da Conta
          </h2>
          <div className="flex items-center gap-3">
            <StatusBadge
              status={user.suspended_at ? "Suspenso" : "Ativo"}
              type="user"
            />
            {user.suspended_at && (
              <span className="text-xs text-[var(--color-text-medium)]">
                Suspenso em:{" "}
                {new Date(user.suspended_at).toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              user.suspended_at
                ? "text-green-700 bg-green-50 hover:bg-green-100"
                : "text-red-700 bg-red-50 hover:bg-red-100"
            }`}
          >
            {user.suspended_at ? "Ativar Usuario" : "Suspender Usuario"}
          </button>
        </div>
      </div>

      {/* User Vouchers */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="border-b border-[var(--color-border)] px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--color-text-dark)]">
            Vouchers do Usuario
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-medium)]">
                <th className="px-6 py-3">Codigo</th>
                <th className="px-6 py-3">Restaurante</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Usado em</th>
              </tr>
            </thead>
            <tbody>
              {(!user.vouchers || user.vouchers.length === 0) ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-sm text-[var(--color-text-light)]"
                  >
                    Nenhum voucher encontrado.
                  </td>
                </tr>
              ) : (
                user.vouchers.map((voucher: any) => (
                  <tr
                    key={voucher.id}
                    className="border-b border-[var(--color-border)] hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-3 font-mono text-sm text-[var(--color-text-dark)]">
                      {voucher.code}
                    </td>
                    <td className="px-6 py-3 text-sm text-[var(--color-text-dark)]">
                      {voucher.restaurant?.name || voucher.restaurant_name || "—"}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge
                        status={voucher.status || "available"}
                        type="voucher"
                      />
                    </td>
                    <td className="px-6 py-3 text-sm text-[var(--color-text-medium)]">
                      {voucher.used_at
                        ? new Date(voucher.used_at).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleToggleSuspend}
        title={user.suspended_at ? "Ativar Usuario" : "Suspender Usuario"}
        message={
          user.suspended_at
            ? `Deseja reativar o usuario "${user.full_name || user.email}"?`
            : `Deseja suspender o usuario "${user.full_name || user.email}"? Ele perdera acesso ao sistema.`
        }
        confirmLabel={user.suspended_at ? "Ativar" : "Suspender"}
        variant={user.suspended_at ? "primary" : "danger"}
      />
    </div>
  );
}
