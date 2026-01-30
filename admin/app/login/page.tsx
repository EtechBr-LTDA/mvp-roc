"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "../lib/api";
import { ShieldCheck, Eye, EyeSlash } from "@phosphor-icons/react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await adminApi.login(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-admin-sidebar)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-roc-primary)]">
            <ShieldCheck size={32} weight="fill" className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">ROC Admin</h1>
          <p className="mt-1 text-sm text-slate-400">Painel Administrativo</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white p-8 shadow-medium"
        >
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-dark)]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
              placeholder="admin@rocpassaporte.com.br"
            />
          </div>

          <div className="mb-6">
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-dark)]">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--color-border)] px-4 py-3 pr-12 text-sm outline-none transition-colors focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                placeholder="Sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-medium)] hover:text-[var(--color-text-dark)]"
              >
                {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--color-roc-primary)] py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-roc-primary-dark)] disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
