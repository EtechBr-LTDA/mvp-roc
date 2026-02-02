"use client";

import { useEffect, useState } from "react";
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

const methodColors: Record<string, string> = {
  GET: "bg-green-100 text-green-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-yellow-100 text-yellow-700",
  PATCH: "bg-orange-100 text-orange-700",
  DELETE: "bg-red-100 text-red-700",
};

export default function PermissionsPage() {
  const [grouped, setGrouped] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminApi.getRbacPermissions();
        setGrouped(data.grouped);
      } catch (err: any) {
        console.error("Erro ao carregar permissoes:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-roc-primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-dark)]">
          Acoes do Sistema
        </h2>
        <p className="text-sm text-gray-500">
          Todas as acoes e endpoints disponiveis no sistema. As permissoes sao gerenciadas na pagina de Permissoes por Cargo.
        </p>
      </div>

      {Object.entries(grouped).map(([module, permissions]) => (
        <div key={module} className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden">
          <div className="px-6 py-3 bg-gray-50 border-b border-[var(--color-border)]">
            <h3 className="font-semibold text-[var(--color-text-dark)]">
              {moduleLabels[module] || module}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left px-6 py-2.5 font-medium text-gray-500">Acao</th>
                  <th className="text-left px-6 py-2.5 font-medium text-gray-500">Descricao</th>
                  <th className="text-left px-6 py-2.5 font-medium text-gray-500">Metodo</th>
                  <th className="text-left px-6 py-2.5 font-medium text-gray-500">Endpoint</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {permissions.map((perm: any) => (
                  <tr key={perm.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3">
                      <span className="font-medium text-[var(--color-text-dark)]">
                        {perm.display_name}
                      </span>
                      <span className="block text-[11px] text-gray-400 font-mono">
                        {perm.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600 text-xs">
                      {perm.description || "—"}
                    </td>
                    <td className="px-6 py-3">
                      {perm.http_method && (
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                            methodColors[perm.http_method] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {perm.http_method}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-gray-500">
                      {perm.endpoint || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
