"use client";

import { useEffect, useState } from "react";
import {
  UserPlus,
  Trash,
  PencilSimple,
  X,
} from "@phosphor-icons/react";
import { adminApi } from "../../../lib/api";

export default function UsersRolesPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRole, setEditingRole] = useState<{ userId: string; currentRoleId: number } | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminsData, rolesData] = await Promise.all([
        adminApi.getAdminUsers(),
        adminApi.getRbacRoles(),
      ]);
      setAdmins(adminsData);
      setRoles(rolesData);
    } catch (err: any) {
      console.error("Erro:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRemoveAdmin = async (userId: string, name: string) => {
    if (!confirm(`Remover acesso admin de "${name}"? O usuario voltara ao cargo normal.`)) return;
    try {
      await adminApi.removeAdminUser(userId);
      setMessage({ type: "success", text: "Acesso removido com sucesso" });
      await loadData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erro ao remover" });
    }
  };

  const handleChangeRole = async (userId: string, roleId: number) => {
    try {
      await adminApi.updateAdminUserRole(userId, roleId);
      setMessage({ type: "success", text: "Cargo atualizado" });
      setEditingRole(null);
      await loadData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erro ao alterar cargo" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-roc-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-dark)]">
            Usuarios e Cargos
          </h2>
          <p className="text-sm text-gray-500">{admins.length} administrador(es)</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
            bg-[var(--color-roc-primary)] rounded-lg hover:opacity-90 transition-opacity"
        >
          <UserPlus size={16} />
          Adicionar Admin
        </button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Admins table */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-[var(--color-border)]">
                <th className="text-left px-6 py-3 font-medium text-gray-500">Nome</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Email</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Cargo</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Desde</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-[var(--color-text-dark)]">
                    {admin.full_name || "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{admin.email}</td>
                  <td className="px-6 py-4">
                    {editingRole?.userId === admin.id ? (
                      <select
                        value={editingRole!.currentRoleId}
                        onChange={(e) => handleChangeRole(admin.id, parseInt(e.target.value))}
                        onBlur={() => setEditingRole(null)}
                        autoFocus
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>{r.display_name}</option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                          admin.role === "super_admin"
                            ? "bg-purple-100 text-purple-700"
                            : admin.role === "editor"
                              ? "bg-green-100 text-green-700"
                              : admin.role === "viewer"
                                ? "bg-gray-100 text-gray-700"
                                : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {admin.admin_role?.display_name || admin.role}
                        <button
                          onClick={() => setEditingRole({ userId: admin.id, currentRoleId: admin.role_id || 1 })}
                          className="ml-1 hover:text-gray-900"
                          title="Alterar cargo"
                        >
                          <PencilSimple size={12} />
                        </button>
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {admin.created_at ? new Date(admin.created_at).toLocaleDateString("pt-BR") : "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRemoveAdmin(admin.id, admin.full_name || admin.email)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Remover acesso admin"
                    >
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Nenhum administrador encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <CreateAdminModal
          roles={roles}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            setMessage({ type: "success", text: "Admin criado com sucesso" });
            loadData();
          }}
        />
      )}
    </div>
  );
}

function CreateAdminModal({
  roles,
  onClose,
  onCreated,
}: {
  roles: any[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({ email: "", name: "", password: "", role_id: roles[0]?.id || 1 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.name || !form.password) {
      setError("Preencha todos os campos");
      return;
    }
    if (form.password.length < 8) {
      setError("Senha deve ter pelo menos 8 caracteres");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await adminApi.createAdminUser(form);
      onCreated();
    } catch (err: any) {
      setError(err.message || "Erro ao criar admin");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h3 className="font-semibold text-[var(--color-text-dark)]">Adicionar Administrador</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-sm bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none
                focus:ring-2 focus:ring-[var(--color-roc-primary)]/20 focus:border-[var(--color-roc-primary)]"
              placeholder="Nome completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none
                focus:ring-2 focus:ring-[var(--color-roc-primary)]/20 focus:border-[var(--color-roc-primary)]"
              placeholder="email@exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none
                focus:ring-2 focus:ring-[var(--color-roc-primary)]/20 focus:border-[var(--color-roc-primary)]"
              placeholder="Minimo 8 caracteres"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
            <select
              value={form.role_id}
              onChange={(e) => setForm((f) => ({ ...f, role_id: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none
                focus:ring-2 focus:ring-[var(--color-roc-primary)]/20 focus:border-[var(--color-roc-primary)]"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.display_name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-600
                border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 text-sm font-medium text-white
                bg-[var(--color-roc-primary)] rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Criando..." : "Criar Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
