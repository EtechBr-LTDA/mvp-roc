"use client";

import { useEffect, useState } from "react";
import {
  FloppyDisk,
  ArrowCounterClockwise,
  Warning,
} from "@phosphor-icons/react";
import { adminApi } from "../../../lib/api";

const categoryLabels: Record<string, string> = {
  general: "Geral",
  passes: "Passes",
  vouchers: "Vouchers",
};

export default function SystemSettingsPage() {
  const [grouped, setGrouped] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Record<string, any>>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSystemSettings();
      setGrouped(data.grouped);
      setChanges({});
    } catch (err: any) {
      console.error("Erro ao carregar configuracoes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const hasChanges = Object.keys(changes).length > 0;

  const handleChange = (key: string, value: any) => {
    setChanges((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
  };

  const getCurrentValue = (setting: any) => {
    if (changes[setting.key] !== undefined) return changes[setting.key];
    return setting.value;
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await adminApi.updateSystemSettings(changes);
      setMessage({ type: "success", text: "Configuracoes salvas com sucesso!" });
      // Reload to get fresh data
      await loadSettings();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erro ao salvar" });
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setChanges({});
    setMessage(null);
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
            Configuracao Geral
          </h2>
          <p className="text-sm text-gray-500">Ajuste as configuracoes do sistema</p>
        </div>
        {hasChanges && (
          <div className="flex gap-2">
            <button
              onClick={handleDiscard}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600
                border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowCounterClockwise size={16} />
              Descartar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                bg-[var(--color-roc-primary)] rounded-lg hover:opacity-90 transition-opacity
                disabled:opacity-50"
            >
              <FloppyDisk size={16} />
              {saving ? "Salvando..." : "Salvar Mudancas"}
            </button>
          </div>
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "error" && <Warning size={16} />}
          {message.text}
        </div>
      )}

      {/* Settings grouped by category */}
      {Object.entries(grouped).map(([category, settings]) => (
        <div key={category} className="bg-white rounded-xl border border-[var(--color-border)]">
          <div className="px-6 py-4 border-b border-[var(--color-border)]">
            <h3 className="font-semibold text-[var(--color-text-dark)]">
              {categoryLabels[category] || category}
            </h3>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {settings.map((setting: any) => (
              <SettingRow
                key={setting.key}
                setting={setting}
                value={getCurrentValue(setting)}
                changed={changes[setting.key] !== undefined}
                onChange={(val) => handleChange(setting.key, val)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingRow({
  setting,
  value,
  changed,
  onChange,
}: {
  setting: any;
  value: any;
  changed: boolean;
  onChange: (value: any) => void;
}) {
  const renderInput = () => {
    switch (setting.value_type) {
      case "boolean":
        return (
          <button
            type="button"
            onClick={() => onChange(!value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? "bg-[var(--color-roc-primary)]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                value ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            className="w-32 px-3 py-1.5 text-sm border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-[var(--color-roc-primary)]/20 focus:border-[var(--color-roc-primary)]
              outline-none"
          />
        );

      default:
        return (
          <input
            type="text"
            value={typeof value === "string" ? value : JSON.stringify(value)}
            onChange={(e) => onChange(e.target.value)}
            className="w-64 px-3 py-1.5 text-sm border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-[var(--color-roc-primary)]/20 focus:border-[var(--color-roc-primary)]
              outline-none"
          />
        );
    }
  };

  return (
    <div className={`flex items-center justify-between px-6 py-4 ${changed ? "bg-yellow-50/50" : ""}`}>
      <div className="flex-1 min-w-0 mr-4">
        <p className="text-sm font-medium text-[var(--color-text-dark)]">
          {setting.label}
          {changed && (
            <span className="ml-2 text-[10px] font-semibold uppercase text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded">
              Alterado
            </span>
          )}
        </p>
        {setting.description && (
          <p className="text-xs text-gray-500 mt-0.5">{setting.description}</p>
        )}
      </div>
      <div className="flex-shrink-0">{renderInput()}</div>
    </div>
  );
}
