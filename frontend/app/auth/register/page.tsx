"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Envelope, Lock, IdentificationCard, Check } from "@phosphor-icons/react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  // Formatação de CPF: 000.000.000-00
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return value;
  };

  // Validação de CPF (formato básico)
  const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, "");
    return numbers.length === 11;
  };

  // Validação de senha
  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setFormData({ ...formData, cpf: formatted });
    if (errors.cpf) {
      setErrors({ ...errors, cpf: "" });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, password: e.target.value });
    if (errors.password) {
      setErrors({ ...errors, password: "" });
    }
    // Limpar erro de confirmação quando a senha principal mudar
    if (errors.passwordConfirmation && e.target.value === formData.passwordConfirmation) {
      setErrors({ ...errors, passwordConfirmation: "" });
    }
  };

  const handlePasswordConfirmationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, passwordConfirmation: e.target.value });
    if (errors.passwordConfirmation) {
      setErrors({ ...errors, passwordConfirmation: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validações
    if (!formData.name.trim()) {
      newErrors.name = "Nome completo é obrigatório";
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório";
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = "CPF deve ter 11 dígitos";
    }

    if (!formData.email.trim()) {
      newErrors.email = "E-mail é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "E-mail inválido";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Senha deve ter no mínimo 6 caracteres";
    }

    if (!formData.passwordConfirmation) {
      newErrors.passwordConfirmation = "Confirmação de senha é obrigatória";
    } else if (formData.password !== formData.passwordConfirmation) {
      newErrors.passwordConfirmation = "As senhas não coincidem";
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "Você deve aceitar os termos de uso";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Se passou nas validações, fazer chamada à API
    setErrors({});
    setSubmitted(true);

    try {
      const { apiClient } = await import("@/app/lib/api");
      await apiClient.register({
        name: formData.name,
        cpf: formData.cpf.replace(/\D/g, ""), // Enviar apenas números
        email: formData.email,
        password: formData.password,
        passwordConfirmation: formData.passwordConfirmation,
      });
      // Redirecionamento será feito após sucesso (tela de sucesso já existe)
    } catch (error: any) {
      setSubmitted(false);
      const errorMessage = error?.message || "Erro ao criar conta. Tente novamente.";
      setErrors({ submit: errorMessage });
      console.error("Erro ao registrar:", error);
    }
  };

  // Tela de Sucesso
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-light)] px-[var(--spacing-4)] py-[var(--spacing-5)]">
        <div className="w-full max-w-[420px] rounded-2xl bg-[var(--color-white)] p-[var(--spacing-5)] text-center shadow-soft">
          <div className="mx-auto mb-[var(--spacing-3)] flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-roc-success)]/10">
            <Check size={32} className="text-[var(--color-roc-success)]" weight="fill" />
          </div>
          <h2 className="mb-[var(--spacing-2)] text-xl font-semibold text-[var(--color-text-dark)]">
            Cadastro realizado!
          </h2>
          <p className="mb-[var(--spacing-4)] text-base leading-relaxed text-[var(--color-text-medium)]">
            Sua conta foi criada com sucesso. Você já pode prosseguir para o pagamento do passaporte.
          </p>
          <Link
            href="/checkout"
            className="inline-block w-full rounded-lg bg-[var(--color-roc-primary)] px-[var(--spacing-4)] py-[var(--spacing-2)] text-sm font-semibold text-[var(--color-white)] transition-all hover:bg-[var(--color-roc-primary-dark)]"
            onClick={(e) => {
              e.preventDefault();
              router.push("/checkout");
            }}
          >
            Continuar para pagamento
          </Link>
        </div>
      </div>
    );
  }

  // Tela de Registro
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-light)] px-[var(--spacing-4)] py-[var(--spacing-5)]">
      <div className="w-full max-w-[420px] rounded-2xl bg-[var(--color-white)] p-[var(--spacing-5)] shadow-soft">
        {/* Card Header */}
        <div className="mb-[var(--spacing-5)] text-center">
          <Link href="/" className="text-xl font-bold text-[var(--color-text-dark)]">
            <span className="text-[var(--color-roc-primary)]">ROC</span> Passaporte
          </Link>
          <h1 className="mt-[var(--spacing-3)] mb-[var(--spacing-2)] text-2xl font-semibold text-[var(--color-text-dark)]">
            Assinar Passaporte ROC
          </h1>
          <p className="text-sm text-[var(--color-text-medium)]">
            Preencha os dados abaixo para criar sua conta e assinar o passaporte.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-[var(--spacing-3)]" noValidate>
          {/* Campo Nome Completo */}
          <div className="flex flex-col gap-[var(--spacing-1)]">
            <label
              htmlFor="name"
              className="flex items-center gap-[var(--spacing-2)] text-sm font-medium text-[var(--color-text-dark)]"
            >
              <User size={16} weight="fill" className="text-[var(--color-text-medium)]" />
              Nome completo
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: "" });
              }}
              className={`w-full rounded-lg border px-[var(--spacing-3)] py-[var(--spacing-2)] text-sm outline-none transition-all ${
                errors.name
                  ? "border-[var(--color-roc-danger)] focus:border-[var(--color-roc-danger)] focus:ring-2 focus:ring-[var(--color-roc-danger)]/20"
                  : "border-[var(--color-border)] focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
              }`}
              placeholder="João Silva"
              required
            />
            {errors.name && (
              <p className="min-h-[1em] text-xs text-[var(--color-roc-danger)]">{errors.name}</p>
            )}
          </div>

          {/* Campo CPF */}
          <div className="flex flex-col gap-[var(--spacing-1)]">
            <label
              htmlFor="cpf"
              className="flex items-center gap-[var(--spacing-2)] text-sm font-medium text-[var(--color-text-dark)]"
            >
              <IdentificationCard
                size={16}
                weight="fill"
                className="text-[var(--color-text-medium)]"
              />
              CPF <span className="text-[var(--color-roc-danger)]">*</span>
            </label>
            <input
              id="cpf"
              name="cpf"
              type="text"
              maxLength={14}
              value={formData.cpf}
              onChange={handleCPFChange}
              className={`w-full rounded-lg border px-[var(--spacing-3)] py-[var(--spacing-2)] text-sm outline-none transition-all ${
                errors.cpf
                  ? "border-[var(--color-roc-danger)] focus:border-[var(--color-roc-danger)] focus:ring-2 focus:ring-[var(--color-roc-danger)]/20"
                  : "border-[var(--color-border)] focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
              }`}
              placeholder="000.000.000-00"
              required
            />
            {errors.cpf && (
              <p className="min-h-[1em] text-xs text-[var(--color-roc-danger)]">{errors.cpf}</p>
            )}
            <p className="text-xs text-[var(--color-text-medium)]">
              Essencial para vincular o passaporte e validação no restaurante.
            </p>
          </div>

          {/* Campo E-mail */}
          <div className="flex flex-col gap-[var(--spacing-1)]">
            <label
              htmlFor="email"
              className="flex items-center gap-[var(--spacing-2)] text-sm font-medium text-[var(--color-text-dark)]"
            >
              <Envelope size={16} weight="fill" className="text-[var(--color-text-medium)]" />
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
              className={`w-full rounded-lg border px-[var(--spacing-3)] py-[var(--spacing-2)] text-sm outline-none transition-all ${
                errors.email
                  ? "border-[var(--color-roc-danger)] focus:border-[var(--color-roc-danger)] focus:ring-2 focus:ring-[var(--color-roc-danger)]/20"
                  : "border-[var(--color-border)] focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
              }`}
              placeholder="seu@email.com"
              required
            />
            {errors.email && (
              <p className="min-h-[1em] text-xs text-[var(--color-roc-danger)]">{errors.email}</p>
            )}
          </div>

          {/* Campo Senha */}
          <div className="flex flex-col gap-[var(--spacing-1)]">
            <label
              htmlFor="password"
              className="flex items-center gap-[var(--spacing-2)] text-sm font-medium text-[var(--color-text-dark)]"
            >
              <Lock size={16} weight="fill" className="text-[var(--color-text-medium)]" />
              Senha
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handlePasswordChange}
              className={`w-full rounded-lg border px-[var(--spacing-3)] py-[var(--spacing-2)] text-sm outline-none transition-all ${
                errors.password
                  ? "border-[var(--color-roc-danger)] focus:border-[var(--color-roc-danger)] focus:ring-2 focus:ring-[var(--color-roc-danger)]/20"
                  : "border-[var(--color-border)] focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
              }`}
              placeholder="Mínimo 6 caracteres"
              required
            />
            {errors.password && (
              <p className="min-h-[1em] text-xs text-[var(--color-roc-danger)]">{errors.password}</p>
            )}
          </div>

          {/* Campo Confirmar Senha */}
          <div className="flex flex-col gap-[var(--spacing-1)]">
            <label
              htmlFor="passwordConfirmation"
              className="flex items-center gap-[var(--spacing-2)] text-sm font-medium text-[var(--color-text-dark)]"
            >
              <Lock size={16} weight="fill" className="text-[var(--color-text-medium)]" />
              Confirmar senha
            </label>
            <input
              id="passwordConfirmation"
              name="passwordConfirmation"
              type="password"
              value={formData.passwordConfirmation}
              onChange={handlePasswordConfirmationChange}
              className={`w-full rounded-lg border px-[var(--spacing-3)] py-[var(--spacing-2)] text-sm outline-none transition-all ${
                errors.passwordConfirmation
                  ? "border-[var(--color-roc-danger)] focus:border-[var(--color-roc-danger)] focus:ring-2 focus:ring-[var(--color-roc-danger)]/20"
                  : "border-[var(--color-border)] focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
              }`}
              placeholder="Digite a senha novamente"
              required
            />
            {errors.passwordConfirmation && (
              <p className="min-h-[1em] text-xs text-[var(--color-roc-danger)]">
                {errors.passwordConfirmation}
              </p>
            )}
          </div>

          {/* Campo Termos de Uso */}
          <div className="flex flex-col gap-[var(--spacing-1)]">
            <div className="flex items-start gap-[var(--spacing-2)]">
              <input
                id="terms"
                name="termsAccepted"
                type="checkbox"
                checked={formData.termsAccepted}
                onChange={(e) => {
                  setFormData({ ...formData, termsAccepted: e.target.checked });
                  if (errors.termsAccepted) setErrors({ ...errors, termsAccepted: "" });
                }}
                className="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                required
              />
              <label htmlFor="terms" className="text-sm text-[var(--color-text-medium)]">
                Eu li e aceito os{" "}
                <Link href="#termos" className="font-medium text-[var(--color-roc-primary)] hover:underline">
                  termos de uso
                </Link>{" "}
                do Rondônia Oferta Club.
              </label>
            </div>
            {errors.termsAccepted && (
              <p className="min-h-[1em] text-xs text-[var(--color-roc-danger)]">
                {errors.termsAccepted}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="mt-[var(--spacing-2)] w-full rounded-lg bg-[var(--color-roc-primary)] px-[var(--spacing-4)] py-[var(--spacing-2)] text-sm font-semibold text-[var(--color-white)] transition-all hover:bg-[var(--color-roc-primary-dark)]"
          >
            Criar conta e continuar
          </button>
        </form>

        {/* Card Footer */}
        <p className="mt-[var(--spacing-4)] text-center text-sm text-[var(--color-text-medium)]">
          Já tem uma conta?{" "}
          <Link href="/" className="font-medium text-[var(--color-roc-primary)] hover:underline">
            Voltar para início
          </Link>
        </p>
      </div>
    </div>
  );
}
