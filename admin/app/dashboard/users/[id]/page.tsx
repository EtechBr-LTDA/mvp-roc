"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  EnvelopeSimple,
  IdentificationCard,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Copy,
  Check,
} from "@phosphor-icons/react";
import { adminApi } from "../../../lib/api";
import { StatusBadge } from "../../../components/StatusBadge";
import { ConfirmDialog } from "../../../components/ConfirmDialog";

function maskCpf(cpf: string | null | undefined): string {
  if (!cpf) return "—";
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf;
  return `${digits.slice(0, 3)}.***.***-${digits.slice(9)}`;
}

export default function UserDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUserDetail(id);
      setUser(data);
    } catch (err: any) {
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

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-40 bg-slate-100 rounded animate-pulse" />
        <div className="h-8 w-64 bg-slate-100 rounded animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-48 bg-white rounded-xl shadow-soft animate-pulse" />
          <div className="h-48 bg-white rounded-xl shadow-soft animate-pulse" />
        </div>
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

  const vouchersUsed = user.vouchers?.filter((v: any) => v.status === "used").length || 0;
  const vouchersTotal = user.vouchers?.length || 0;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/users"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-text-medium)] hover:text-[var(--color-text-dark)] transition-colors"
      >
        <ArrowLeft size={18} />
        Voltar para Usuarios
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[var(--color-roc-primary)]/10 flex items-center justify-center">
            <User size={28} className="text-[var(--color-roc-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">
              {user.full_name || user.email}
            </h1>
            <p className="text-sm text-[var(--color-text-medium)]">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge
            status={user.suspended_at ? "Suspenso" : "Ativo"}
            type="user"
          />
          <button
            onClick={() => setConfirmOpen(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              user.suspended_at
                ? "text-green-700 bg-green-50 hover:bg-green-100 border border-green-200"
                : "text-red-700 bg-red-50 hover:bg-red-100 border border-red-200"
            }`}
          >
            {user.suspended_at ? "Reativar Usuario" : "Suspender Usuario"}
          </button>
        </div>
      </div>

      {/* Cards: Dados Pessoais + Status da Conta */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Dados Pessoais */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-base font-semibold text-[var(--color-text-dark)] mb-4">
            Dados Pessoais
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
            <InfoItem icon={<User size={16} />} label="Nome Completo" value={user.full_name} />
            <InfoItem icon={<EnvelopeSimple size={16} />} label="Email" value={user.email} />
            <InfoItem icon={<IdentificationCard size={16} />} label="CPF" value={maskCpf(user.cpf)} />
            <InfoItem icon={<Phone size={16} />} label="Telefone" value={user.phone} />
            <InfoItem icon={<MapPin size={16} />} label="Cidade" value={user.city || user.address_city} />
            <InfoItem
              icon={<MapPin size={16} />}
              label="Endereco"
              value={
                user.address_street
                  ? `${user.address_street}${user.address_number ? `, ${user.address_number}` : ""}${user.address_complement ? ` - ${user.address_complement}` : ""}`
                  : null
              }
            />
            <InfoItem icon={<MapPin size={16} />} label="CEP" value={user.address_zip} />
            <InfoItem
              icon={<Calendar size={16} />}
              label="Criado em"
              value={
                user.created_at
                  ? new Date(user.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : null
              }
            />
          </div>
        </div>

        {/* Status da Conta */}
        <div className="bg-white rounded-xl shadow-soft p-6 flex flex-col gap-5">
          <h2 className="text-base font-semibold text-[var(--color-text-dark)]">
            Status da Conta
          </h2>

          {/* Conta */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-medium)]">Conta</span>
            <StatusBadge status={user.suspended_at ? "Suspenso" : "Ativo"} type="user" />
          </div>
          {user.suspended_at && (
            <p className="text-xs text-[var(--color-text-light)] -mt-3">
              Suspenso em: {new Date(user.suspended_at).toLocaleDateString("pt-BR")}
            </p>
          )}

          <div className="border-t border-[var(--color-border)]" />

          {/* Passe */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-medium)]">Passe</span>
            <StatusBadge
              status={user.pass ? "Ativo" : "Inativo"}
              type="user"
            />
          </div>
          {user.pass?.expires_at && (
            <p className="text-xs text-[var(--color-text-light)] -mt-3">
              Expira em: {new Date(user.pass.expires_at).toLocaleDateString("pt-BR")}
            </p>
          )}

          <div className="border-t border-[var(--color-border)]" />

          {/* Vouchers resumo */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-medium)]">Vouchers</span>
            <span className="text-sm font-semibold text-[var(--color-text-dark)]">
              {vouchersUsed} / {vouchersTotal} usados
            </span>
          </div>
          {vouchersTotal > 0 && (
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden -mt-3">
              <div
                className="h-full bg-[var(--color-roc-primary)] rounded-full transition-all duration-500"
                style={{ width: `${(vouchersUsed / vouchersTotal) * 100}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Historico de Validacoes */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="border-b border-[var(--color-border)] px-6 py-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--color-text-dark)]">
            Historico de Vouchers
          </h2>
          <span className="text-xs text-[var(--color-text-medium)]">
            {vouchersTotal} voucher{vouchersTotal !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-medium)]">
                <th className="px-6 py-3">Codigo</th>
                <th className="px-6 py-3">Restaurante</th>
                <th className="px-6 py-3">Oferta</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Usado em</th>
              </tr>
            </thead>
            <tbody>
              {(!user.vouchers || user.vouchers.length === 0) ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-[var(--color-text-light)]">
                    Nenhum voucher encontrado.
                  </td>
                </tr>
              ) : (
                user.vouchers.map((voucher: any) => (
                  <tr
                    key={voucher.id}
                    className="border-b border-[var(--color-border)] hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-[var(--color-text-dark)]">
                          {voucher.code}
                        </span>
                        <button
                          onClick={() => copyCode(voucher.code)}
                          className="text-[var(--color-text-light)] hover:text-[var(--color-roc-primary)] transition-colors"
                          title="Copiar codigo"
                        >
                          {copiedCode === voucher.code ? (
                            <Check size={14} className="text-green-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-[var(--color-text-dark)]">
                      {voucher.restaurant?.name || "—"}
                    </td>
                    <td className="px-6 py-3 text-sm text-[var(--color-text-medium)]">
                      {voucher.restaurant?.discount_label || "—"}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={voucher.status || "available"} type="voucher" />
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

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-[var(--color-text-light)]">{icon}</div>
      <div>
        <p className="text-[10px] font-semibold text-[var(--color-text-light)] uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm text-[var(--color-text-dark)] mt-0.5">
          {value || "—"}
        </p>
      </div>
    </div>
  );
}
