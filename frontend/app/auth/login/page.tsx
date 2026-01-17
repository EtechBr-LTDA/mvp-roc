"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiClient, ApiError } from "@/app/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await apiClient.login(email, password);
      router.push("/account/vouchers");
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-light)] px-[var(--spacing-4)]">
      <div className="w-full max-w-md rounded-2xl bg-[var(--color-white)] p-[var(--spacing-4)] shadow-soft">
        <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight">
          Fazer login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-[var(--color-roc-danger)]/10 border border-[var(--color-roc-danger)]/20 px-3 py-2 text-sm text-[var(--color-roc-danger)]">
              {error}
            </div>
          )}
          <div className="space-y-1 text-sm">
            <label htmlFor="email" className="block font-medium text-[var(--color-text-dark)]">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-roc-primary)] focus:ring-1 focus:ring-[var(--color-roc-primary)] disabled:opacity-50"
            />
          </div>
          <div className="space-y-1 text-sm">
            <label htmlFor="password" className="block font-medium text-[var(--color-text-dark)]">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-roc-primary)] focus:ring-1 focus:ring-[var(--color-roc-primary)] disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-lg bg-[var(--color-roc-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-white)] hover:bg-[var(--color-roc-primary-dark)] disabled:opacity-50"
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-[var(--color-text-medium)]">
          Ainda não tem conta?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-[var(--color-roc-primary)] hover:underline"
          >
            Assine agora
          </Link>
        </p>
      </div>
    </div>
  );
}

