"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Envelope,
  Lock,
  Eye,
  EyeSlash,
  ArrowRight,
  ShieldCheck,
  Sparkle,
  ForkKnife,
} from "@phosphor-icons/react";
import { apiClient, ApiError } from "@/app/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Normalizar email para minúsculas antes de enviar
      const normalizedEmail = email.toLowerCase().trim();
      await apiClient.login(normalizedEmail, password, rememberMe);
      window.location.href = "/account/vouchers";
      return;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Coluna Esquerda - Brand/Visual (hidden em mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[var(--color-roc-primary)] to-[var(--color-roc-primary-dark)] overflow-hidden">
        {/* Imagem de fundo com overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop&q=80')",
          }}
        />

        {/* Conteúdo */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white">
          <Link href="/" className="mb-12">
            <span className="text-3xl font-bold">
              <span className="text-white">ROC</span>{" "}
              <span className="text-white/80">Passaporte</span>
            </span>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
              <Sparkle size={18} weight="fill" />
              <span className="text-sm font-medium">Acesso exclusivo</span>
            </div>

            <h2 className="mb-4 text-4xl xl:text-5xl font-bold leading-tight">
              Bem-vindo de volta!
            </h2>
            <p className="mb-8 text-xl text-white/80">
              Sua próxima experiência gastronômica em Rondônia está a apenas um clique de distância.
            </p>

            {/* Benefícios */}
            <ul className="space-y-4">
              {[
                "Acesse seus vouchers de desconto",
                "Descubra novos restaurantes parceiros",
                "Economize até R$300 em 90 dias",
              ].map((benefit, index) => (
                <motion.li
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                    <ForkKnife size={14} weight="fill" />
                  </div>
                  <span className="text-lg">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Estatísticas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex gap-8"
          >
            <div>
              <p className="text-3xl font-bold">25+</p>
              <p className="text-sm text-white/70">Restaurantes</p>
            </div>
            <div>
              <p className="text-3xl font-bold">5</p>
              <p className="text-sm text-white/70">Cidades</p>
            </div>
            <div>
              <p className="text-3xl font-bold">30%</p>
              <p className="text-sm text-white/70">Desconto médio</p>
            </div>
          </motion.div>
        </div>

        {/* Decoração geométrica */}
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -top-16 -left-16 h-32 w-32 rounded-full bg-white/10" />
      </div>

      {/* Coluna Direita - Formulário */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-[var(--color-bg-light)] px-4 py-8 sm:px-8">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-[var(--color-roc-primary)]">ROC</span>{" "}
              <span className="text-[var(--color-text-dark)]">Passaporte</span>
            </Link>
          </div>

          {/* Card do formulário */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white p-6 sm:p-8 shadow-soft"
          >
            {/* Título */}
            <div className="mb-6 text-center lg:text-left">
              <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">
                Faça seu login
              </h1>
              <p className="mt-1 text-sm text-[var(--color-text-medium)]">
                Acesse sua conta para ver seus vouchers
              </p>
            </div>

            {/* Erro */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 rounded-xl bg-[var(--color-roc-danger)]/10 border border-[var(--color-roc-danger)]/20 px-4 py-3 text-sm text-[var(--color-roc-danger)]"
              >
                {error}
              </motion.div>
            )}

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-dark)]"
                >
                  <Envelope size={16} weight="fill" className="text-[var(--color-text-medium)]" />
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none transition-all focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20 disabled:opacity-50"
                  placeholder="seu@email.com"
                />
              </div>

              {/* Senha */}
              <div className="space-y-1">
                <label
                  htmlFor="password"
                  className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-dark)]"
                >
                  <Lock size={16} weight="fill" className="text-[var(--color-text-medium)]" />
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 pr-12 text-sm outline-none transition-all focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20 disabled:opacity-50"
                    placeholder="Digite sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-medium)] hover:text-[var(--color-text-dark)] transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Lembrar de mim + Esqueceu senha */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-roc-primary)] focus:ring-[var(--color-roc-primary)]"
                  />
                  <span className="text-sm text-[var(--color-text-medium)]">Lembrar de mim</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-[var(--color-roc-primary)] hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              {/* Botão de Login */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-roc-primary)] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--color-roc-primary-dark)] hover:shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Entrando...
                  </>
                ) : (
                  <>
                    Entrar
                    <ArrowRight size={18} weight="bold" />
                  </>
                )}
              </button>
            </form>

            {/* Divisor */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-[var(--color-border)]" />
              <span className="text-xs text-[var(--color-text-medium)]">ou</span>
              <div className="h-px flex-1 bg-[var(--color-border)]" />
            </div>

            {/* Link para cadastro */}
            <div className="text-center">
              <p className="text-sm text-[var(--color-text-medium)]">
                Ainda não tem uma conta?
              </p>
              <Link
                href="/auth/register"
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-roc-primary)] hover:underline"
              >
                Assine agora e economize
                <ArrowRight size={16} weight="bold" />
              </Link>
            </div>
          </motion.div>

          {/* Indicador de segurança */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--color-text-medium)]">
            <ShieldCheck size={16} weight="fill" className="text-[var(--color-roc-success)]" />
            <span>Conexão segura com criptografia SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
