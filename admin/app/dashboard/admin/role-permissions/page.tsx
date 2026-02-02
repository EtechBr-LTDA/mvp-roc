"use client";

import { useEffect, useState } from "react";
import {
  FloppyDisk,
  CheckSquare,
  Square,
} from "@phosphor-icons/react";
import { adminApi } from "../../../lib/api";

const moduleLabels: Record<string, string> = {
  dashboard: "Dashboard",
  users: "Usuarios",
  restaurants: "Restaurantes",
  vouchers: "Vouchers",
  geo: "Geolocalizacao",
  audit: "Auditoria",
  stats: "Estatisticas",
  settings: "Configuracoes",
  rbac: "Controle de Admin",
};

export default function RolePermissionsPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [grouped, setGrouped] = useState<Record<string, any[]>>({});
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [rolePermissionIds, setRolePermissionIds] = useState<Set<number>>(new Set());
  const [originalIds, setOriginalIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [rolesData, permsData] = await Promise.all([
          adminApi.getRbacRoles(),
          adminApi.getRbacPermissions(),
        ]);
        setRoles(rolesData);
        setPermissions(permsData.permissions);
        setGrouped(permsData.grouped);
        if (rolesData.length > 0) {
          await selectRole(rolesData[0].id);
        }
      } catch (err: any) {
        console.error("Erro:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selectRole = async (roleId: number) => {
    setSelectedRoleId(roleId);
    setMessage(null);
    try {
      const detail = await adminApi.getRbacRoleDetail(roleId);
      const ids = new Set<number>(detail.permission_ids || []);
      setRolePermissionIds(ids);
      setOriginalIds(new Set(ids));
    } catch (err: any) {
      console.error("Erro ao carregar permissoes do cargo:", err);
    }
  };

  const togglePermission = (permId: number) => {
    setRolePermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
    setMessage(null);
  };

  const toggleModule = (modulePerms: any[]) => {
    const moduleIds = modulePerms.map((p) => p.id);
    const allSelected = moduleIds.every((id) => rolePermissionIds.has(id));

    setRolePermissionIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        moduleIds.forEach((id) => next.delete(id));
      } else {
        moduleIds.forEach((id) => next.add(id));
      }
      return next;
    });
    setMessage(null);
  };

  const hasChanges = () => {
    if (rolePermissionIds.size !== originalIds.size) return true;
    for (const id of rolePermissionIds) {
      if (!originalIds.has(id)) return true;
    }
    return false;
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    setMessage(null);
    try {
      await adminApi.setRbacRolePermissions(selectedRoleId, Array.from(rolePermissionIds));
      setOriginalIds(new Set(rolePermissionIds));
      setMessage({ type: "success", text: "Permissoes salvas com sucesso!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erro ao salvar" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-roc-primary)]" />
      </div>
    );
  }

  const selectedRole = roles.find((r) => r.id === selectedRoleId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-dark)]">
            Permissoes por Cargo
          </h2>
          <p className="text-sm text-gray-500">
            Selecione um cargo e defina quais acoes ele pode executar
          </p>
        </div>
        {hasChanges() && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
              bg-[var(--color-roc-primary)] rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            <FloppyDisk size={16} />
            {saving ? "Salvando..." : "Salvar Permissoes"}
          </button>
        )}
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

      <div className="flex gap-6">
        {/* Roles list */}
        <div className="w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-[var(--color-border)]">
              <h3 className="text-sm font-semibold text-gray-600">Cargos</h3>
            </div>
            <div className="divide-y divide-[var(--color-border)]">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => selectRole(role.id)}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    selectedRoleId === role.id
                      ? "bg-[var(--color-roc-primary)]/10 text-[var(--color-roc-primary)] font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="block">{role.display_name}</span>
                  <span className="text-[10px] text-gray-400">
                    {role.admins_count || 0} admin(s)
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Permissions matrix */}
        <div className="flex-1 space-y-4">
          {selectedRole && (
            <div className="bg-white rounded-lg border border-[var(--color-border)] px-4 py-3">
              <p className="text-sm">
                <span className="font-medium text-[var(--color-text-dark)]">
                  {selectedRole.display_name}
                </span>
                {selectedRole.description && (
                  <span className="text-gray-500 ml-2">— {selectedRole.description}</span>
                )}
              </p>
            </div>
          )}

          {Object.entries(grouped).map(([module, modulePerms]) => {
            const moduleIds = modulePerms.map((p: any) => p.id);
            const selectedCount = moduleIds.filter((id: number) => rolePermissionIds.has(id)).length;
            const allSelected = selectedCount === moduleIds.length;

            return (
              <div key={module} className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-[var(--color-border)]">
                  <h4 className="text-sm font-semibold text-gray-600">
                    {moduleLabels[module] || module}
                  </h4>
                  <button
                    onClick={() => toggleModule(modulePerms)}
                    className="text-xs text-[var(--color-roc-primary)] hover:underline"
                  >
                    {allSelected ? "Desmarcar todos" : "Selecionar todos"}
                  </button>
                </div>
                <div className="divide-y divide-[var(--color-border)]">
                  {modulePerms.map((perm: any) => {
                    const checked = rolePermissionIds.has(perm.id);
                    const changed = checked !== originalIds.has(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50/50 ${
                          changed ? "bg-yellow-50/50" : ""
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => togglePermission(perm.id)}
                          className={checked ? "text-[var(--color-roc-primary)]" : "text-gray-300"}
                        >
                          {checked ? <CheckSquare size={20} weight="fill" /> : <Square size={20} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-[var(--color-text-dark)]">
                            {perm.display_name}
                          </span>
                          <span className="block text-[11px] text-gray-400">{perm.action}</span>
                        </div>
                        {changed && (
                          <span className="text-[10px] font-semibold uppercase text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded">
                            Alterado
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
