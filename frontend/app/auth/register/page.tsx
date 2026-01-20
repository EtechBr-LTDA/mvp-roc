"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Envelope,
  Lock,
  IdentificationCard,
  Check,
  MapPin,
  House,
  Buildings,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  SpinnerGap,
} from "@phosphor-icons/react";

// Dados dinâmicos para cada etapa (coluna esquerda)
const stepContent = {
  1: {
    title: "Vamos começar!",
    subtitle: "Informe seus dados básicos para criar sua conta.",
    highlight: "Rápido e seguro",
    benefits: [
      "Cadastro em menos de 2 minutos",
      "Seus dados estão protegidos",
      "Acesso a descontos exclusivos",
    ],
  },
  2: {
    title: "Proteja sua conta",
    subtitle: "Crie uma senha segura para acessar seus benefícios.",
    highlight: "Segurança garantida",
    benefits: [
      "Senha criptografada",
      "Acesso exclusivo aos seus vouchers",
      "Controle total da sua conta",
    ],
  },
  3: {
    title: "Quase lá!",
    subtitle: "Informe seu endereço para receber seu passaporte físico.",
    highlight: "Entrega gratuita",
    benefits: [
      "Envio para todo o estado",
      "Rastreamento disponível",
      "Sem custo adicional",
    ],
  },
};

interface AddressData {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const router = useRouter();

  // Dados do formulário
  const [formData, setFormData] = useState({
    // Etapa 1 - Identificação
    name: "",
    cpf: "",
    email: "",
    // Etapa 2 - Segurança
    password: "",
    passwordConfirmation: "",
    termsAccepted: false,
    // Etapa 3 - Endereço
    address: {
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
    } as AddressData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

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

  // Formatação de CEP: 00000-000
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d)/, "$1-$2");
    }
    return value;
  };

  // Validação de CPF
  const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, "");
    return numbers.length === 11;
  };

  // Validação de senha (8+ caracteres, maiúscula, minúscula, número)
  const validatePassword = (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    );
  };

  // Buscar endereço pelo CEP (ViaCEP)
  const fetchAddressByCep = async (cep: string) => {
    const numbers = cep.replace(/\D/g, "");
    if (numbers.length !== 8) return;

    setIsFetchingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${numbers}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            street: data.logradouro || "",
            neighborhood: data.bairro || "",
            city: data.localidade || "",
            state: data.uf || "",
          },
        }));
        // Limpar erros de endereço se preenchidos
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.street;
          delete newErrors.neighborhood;
          delete newErrors.city;
          delete newErrors.state;
          return newErrors;
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setIsFetchingCep(false);
    }
  };

  // Handler para mudança de CEP
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, cep: formatted },
    }));
    if (errors.cep) {
      setErrors((prev) => ({ ...prev, cep: "" }));
    }

    // Auto-buscar quando CEP completo
    const numbers = formatted.replace(/\D/g, "");
    if (numbers.length === 8) {
      fetchAddressByCep(formatted);
    }
  };

  // Validação por etapa
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
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
    }

    if (step === 2) {
      if (!formData.password) {
        newErrors.password = "Senha é obrigatória";
      } else if (!validatePassword(formData.password)) {
        newErrors.password = "A senha não atende aos requisitos mínimos";
      }
      if (!formData.passwordConfirmation) {
        newErrors.passwordConfirmation = "Confirmação de senha é obrigatória";
      } else if (formData.password !== formData.passwordConfirmation) {
        newErrors.passwordConfirmation = "As senhas não coincidem";
      }
      if (!formData.termsAccepted) {
        newErrors.termsAccepted = "Você deve aceitar os termos de uso";
      }
    }

    if (step === 3) {
      const { address } = formData;
      if (!address.cep.trim() || address.cep.replace(/\D/g, "").length !== 8) {
        newErrors.cep = "CEP inválido";
      }
      if (!address.street.trim()) {
        newErrors.street = "Rua é obrigatória";
      }
      if (!address.number.trim()) {
        newErrors.number = "Número é obrigatório";
      }
      if (!address.neighborhood.trim()) {
        newErrors.neighborhood = "Bairro é obrigatório";
      }
      if (!address.city.trim()) {
        newErrors.city = "Cidade é obrigatória";
      }
      if (!address.state.trim()) {
        newErrors.state = "Estado é obrigatório";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Avançar etapa
  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  // Voltar etapa
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Submeter formulário
  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsLoading(true);
    setErrors({});

    try {
      const { apiClient } = await import("@/app/lib/api");
      // Normalizar email para minúsculas antes de enviar
      const normalizedEmail = formData.email.toLowerCase().trim();
      await apiClient.register({
        name: formData.name,
        cpf: formData.cpf.replace(/\D/g, ""),
        email: normalizedEmail,
        password: formData.password,
        passwordConfirmation: formData.passwordConfirmation,
        address: {
          cep: formData.address.cep.replace(/\D/g, ""),
          street: formData.address.street,
          number: formData.address.number,
          complement: formData.address.complement,
          neighborhood: formData.address.neighborhood,
          city: formData.address.city,
          state: formData.address.state,
        },
      });
      setSubmitted(true);
    } catch (error: any) {
      let errorMessage = "Erro ao criar conta. Tente novamente.";
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error?.error) {
        errorMessage =
          typeof error.error === "string"
            ? error.error
            : error.error.message || errorMessage;
      }

      // Mapear erros do backend para campos específicos
      const lowerError = errorMessage.toLowerCase();
      if (lowerError.includes("cpf")) {
        setErrors({ cpf: errorMessage });
        setCurrentStep(1);
      } else if (lowerError.includes("e-mail") || lowerError.includes("email")) {
        setErrors({ email: errorMessage });
        setCurrentStep(1);
      } else if (lowerError.includes("senha") || lowerError.includes("password")) {
        setErrors({ password: errorMessage });
        setCurrentStep(2);
      } else {
        setErrors({ submit: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Componente da barra de progresso
  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all ${
                step < currentStep
                  ? "border-[var(--color-roc-success)] bg-[var(--color-roc-success)] text-white"
                  : step === currentStep
                  ? "border-[var(--color-roc-primary)] bg-[var(--color-roc-primary)] text-white"
                  : "border-[var(--color-border)] bg-white text-[var(--color-text-medium)]"
              }`}
            >
              {step < currentStep ? <Check size={20} weight="bold" /> : step}
            </div>
            {step < 3 && (
              <div
                className={`h-1 w-16 sm:w-24 md:w-32 mx-2 rounded-full transition-all ${
                  step < currentStep
                    ? "bg-[var(--color-roc-success)]"
                    : "bg-[var(--color-border)]"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-[var(--color-text-medium)]">
        <span className={currentStep >= 1 ? "text-[var(--color-roc-primary)] font-medium" : ""}>
          Identificação
        </span>
        <span className={currentStep >= 2 ? "text-[var(--color-roc-primary)] font-medium" : ""}>
          Segurança
        </span>
        <span className={currentStep >= 3 ? "text-[var(--color-roc-primary)] font-medium" : ""}>
          Entrega
        </span>
      </div>
    </div>
  );

  // Tela de Sucesso
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--color-roc-primary)] to-[var(--color-roc-primary-dark)] px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-roc-success)]/10"
          >
            <Check size={40} className="text-[var(--color-roc-success)]" weight="bold" />
          </motion.div>
          <h2 className="mb-3 text-2xl font-bold text-[var(--color-text-dark)]">
            Cadastro realizado com sucesso!
          </h2>
          <p className="mb-6 text-base leading-relaxed text-[var(--color-text-medium)]">
            Sua conta foi criada e seu passaporte será enviado para o endereço informado.
            Você já pode prosseguir para o pagamento.
          </p>
          <Link
            href="/checkout"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-roc-primary)] px-6 py-4 text-base font-semibold text-white transition-all hover:bg-[var(--color-roc-primary-dark)] hover:shadow-lg"
          >
            Continuar para pagamento
            <ArrowRight size={20} weight="bold" />
          </Link>
        </motion.div>
      </div>
    );
  }

  // Layout Split-Screen
  return (
    <div className="flex min-h-screen">
      {/* Coluna Esquerda - Brand/Visual (hidden em mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[var(--color-roc-primary)] to-[var(--color-roc-primary-dark)] overflow-hidden">
        {/* Imagem de fundo com overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&h=800&fit=crop&q=80')",
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

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Badge da etapa */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                {currentStep === 1 && <User size={18} weight="fill" />}
                {currentStep === 2 && <ShieldCheck size={18} weight="fill" />}
                {currentStep === 3 && <Truck size={18} weight="fill" />}
                <span className="text-sm font-medium">
                  {stepContent[currentStep as keyof typeof stepContent].highlight}
                </span>
              </div>

              <h2 className="mb-4 text-4xl xl:text-5xl font-bold leading-tight">
                {stepContent[currentStep as keyof typeof stepContent].title}
              </h2>
              <p className="mb-8 text-xl text-white/80">
                {stepContent[currentStep as keyof typeof stepContent].subtitle}
              </p>

              {/* Lista de benefícios */}
              <ul className="space-y-4">
                {stepContent[currentStep as keyof typeof stepContent].benefits.map(
                  (benefit, index) => (
                    <motion.li
                      key={benefit}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                        <Check size={14} weight="bold" />
                      </div>
                      <span className="text-lg">{benefit}</span>
                    </motion.li>
                  )
                )}
              </ul>
            </motion.div>
          </AnimatePresence>

          {/* Indicador de passos */}
          <div className="mt-12 flex gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 rounded-full transition-all ${
                  step === currentStep
                    ? "w-8 bg-white"
                    : step < currentStep
                    ? "w-2 bg-white/60"
                    : "w-2 bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Decoração geométrica */}
        <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -top-16 -left-16 h-32 w-32 rounded-full bg-white/10" />
      </div>

      {/* Coluna Direita - Formulário */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-[var(--color-bg-light)] px-4 py-8 sm:px-8">
        <div className="w-full max-w-lg">
          {/* Logo mobile */}
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-[var(--color-roc-primary)]">ROC</span>{" "}
              <span className="text-[var(--color-text-dark)]">Passaporte</span>
            </Link>
          </div>

          {/* Card do formulário */}
          <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-soft">
            {/* Barra de progresso */}
            <ProgressBar />

            {/* Título do passo */}
            <div className="mb-6 text-center lg:text-left">
              <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">
                {currentStep === 1 && "Dados pessoais"}
                {currentStep === 2 && "Crie sua senha"}
                {currentStep === 3 && "Endereço de entrega"}
              </h1>
              <p className="mt-1 text-sm text-[var(--color-text-medium)]">
                {currentStep === 1 && "Informe seus dados para identificação"}
                {currentStep === 2 && "Proteja sua conta com uma senha segura"}
                {currentStep === 3 && "Onde devemos enviar seu passaporte?"}
              </p>
            </div>

            {/* Erro geral de submit */}
            {errors.submit && (
              <div className="mb-4 rounded-lg bg-[var(--color-roc-danger)]/10 p-3 text-sm text-[var(--color-roc-danger)]">
                {errors.submit}
              </div>
            )}

            {/* Formulário */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <AnimatePresence mode="wait">
                {/* ETAPA 1 - Identificação */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Nome */}
                    <div className="space-y-1">
                      <label
                        htmlFor="name"
                        className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-dark)]"
                      >
                        <User size={16} weight="fill" className="text-[var(--color-text-medium)]" />
                        Nome completo
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (errors.name) setErrors({ ...errors, name: "" });
                        }}
                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                          errors.name
                            ? "border-[var(--color-roc-danger)] focus:ring-2 focus:ring-[var(--color-roc-danger)]/20"
                            : "border-[var(--color-border)] focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                        }`}
                        placeholder="João Silva"
                      />
                      {errors.name && (
                        <p className="text-xs text-[var(--color-roc-danger)]">{errors.name}</p>
                      )}
                    </div>

                    {/* CPF */}
                    <div className="space-y-1">
                      <label
                        htmlFor="cpf"
                        className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-dark)]"
                      >
                        <IdentificationCard
                          size={16}
                          weight="fill"
                          className="text-[var(--color-text-medium)]"
                        />
                        CPF
                      </label>
                      <input
                        id="cpf"
                        type="text"
                        maxLength={14}
                        value={formData.cpf}
                        onChange={(e) => {
                          const formatted = formatCPF(e.target.value);
                          setFormData({ ...formData, cpf: formatted });
                          if (errors.cpf) setErrors({ ...errors, cpf: "" });
                        }}
                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                          errors.cpf
                            ? "border-[var(--color-roc-danger)] focus:ring-2 focus:ring-[var(--color-roc-danger)]/20"
                            : "border-[var(--color-border)] focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                        }`}
                        placeholder="000.000.000-00"
                      />
                      {errors.cpf && (
                        <p className="text-xs text-[var(--color-roc-danger)]">{errors.cpf}</p>
                      )}
                      <p className="text-xs text-[var(--color-text-medium)]">
                        Usado para vincular seu passaporte e validar nos restaurantes.
                      </p>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label
                        htmlFor="email"
                        className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-dark)]"
                      >
                        <Envelope
                          size={16}
                          weight="fill"
                          className="text-[var(--color-text-medium)]"
                        />
                        E-mail
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: "" });
                        }}
                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                          errors.email
                            ? "border-[var(--color-roc-danger)] focus:ring-2 focus:ring-[var(--color-roc-danger)]/20"
                            : "border-[var(--color-border)] focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                        }`}
                        placeholder="seu@email.com"
                      />
                      {errors.email && (
                        <p className="text-xs text-[var(--color-roc-danger)]">{errors.email}</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ETAPA 2 - Segurança */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Senha */}
                    <div className="space-y-1">
                      <label
                        htmlFor="password"
                        className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-dark)]"
                      >
                        <Lock size={16} weight="fill" className="text-[var(--color-text-medium)]" />
                        Senha
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({ ...formData, password: e.target.value });
                          if (errors.password) setErrors({ ...errors, password: "" });
                        }}
                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                          errors.password
                            ? "border-[var(--color-roc-danger)] focus:ring-2 focus:ring-[var(--color-roc-danger)]/20"
                            : "border-[var(--color-border)] focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                        }`}
                        placeholder="Crie uma senha segura"
                      />
                      {errors.password && (
                        <p className="text-xs text-[var(--color-roc-danger)]">{errors.password}</p>
                      )}
                      {/* Requisitos da senha */}
                      <div className="mt-2 space-y-1 rounded-lg bg-[var(--color-bg-light)] p-3">
                        <p className="text-xs font-medium text-[var(--color-text-dark)] mb-2">
                          A senha deve conter:
                        </p>
                        <div className="grid grid-cols-2 gap-1">
                          <div className={`flex items-center gap-1.5 text-xs ${formData.password.length >= 8 ? 'text-[var(--color-roc-success)]' : 'text-[var(--color-text-medium)]'}`}>
                            <Check size={12} weight="bold" className={formData.password.length >= 8 ? '' : 'opacity-30'} />
                            Mínimo 8 caracteres
                          </div>
                          <div className={`flex items-center gap-1.5 text-xs ${/[A-Z]/.test(formData.password) ? 'text-[var(--color-roc-success)]' : 'text-[var(--color-text-medium)]'}`}>
                            <Check size={12} weight="bold" className={/[A-Z]/.test(formData.password) ? '' : 'opacity-30'} />
                            Letra maiúscula
                          </div>
                          <div className={`flex items-center gap-1.5 text-xs ${/[a-z]/.test(formData.password) ? 'text-[var(--color-roc-success)]' : 'text-[var(--color-text-medium)]'}`}>
                            <Check size={12} weight="bold" className={/[a-z]/.test(formData.password) ? '' : 'opacity-30'} />
                            Letra minúscula
                          </div>
                          <div className={`flex items-center gap-1.5 text-xs ${/[0-9]/.test(formData.password) ? 'text-[var(--color-roc-success)]' : 'text-[var(--color-text-medium)]'}`}>
                            <Check size={12} weight="bold" className={/[0-9]/.test(formData.password) ? '' : 'opacity-30'} />
                            Número
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Confirmação de senha */}
                    <div className="space-y-1">
                      <label
                        htmlFor="passwordConfirmation"
                        className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-dark)]"
                      >
                        <Lock size={16} weight="fill" className="text-[var(--color-text-medium)]" />
                        Confirmar senha
                      </label>
                      <input
                        id="passwordConfirmation"
                        type="password"
                        value={formData.passwordConfirmation}
                        onChange={(e) => {
                          setFormData({ ...formData, passwordConfirmation: e.target.value });
                          if (errors.passwordConfirmation)
                            setErrors({ ...errors, passwordConfirmation: "" });
                        }}
                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                          errors.passwordConfirmation
                            ? "border-[var(--color-roc-danger)] focus:ring-2 focus:ring-[var(--color-roc-danger)]/20"
                            : "border-[var(--color-border)] focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                        }`}
                        placeholder="Digite a senha novamente"
                      />
                      {errors.passwordConfirmation && (
                        <p className="text-xs text-[var(--color-roc-danger)]">
                          {errors.passwordConfirmation}
                        </p>
                      )}
                    </div>

                    {/* Termos */}
                    <div className="space-y-1">
                      <div className="flex items-start gap-3">
                        <input
                          id="terms"
                          type="checkbox"
                          checked={formData.termsAccepted}
                          onChange={(e) => {
                            setFormData({ ...formData, termsAccepted: e.target.checked });
                            if (errors.termsAccepted)
                              setErrors({ ...errors, termsAccepted: "" });
                          }}
                          className="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-roc-primary)]"
                        />
                        <label htmlFor="terms" className="text-sm text-[var(--color-text-medium)]">
                          Li e aceito os{" "}
                          <Link
                            href="/termos"
                            className="font-medium text-[var(--color-roc-primary)] hover:underline"
                          >
                            termos de uso
                          </Link>{" "}
                          e a{" "}
                          <Link
                            href="/privacidade"
                            className="font-medium text-[var(--color-roc-primary)] hover:underline"
                          >
                            política de privacidade
                          </Link>
                          .
                        </label>
                      </div>
                      {errors.termsAccepted && (
                        <p className="text-xs text-[var(--color-roc-danger)]">
                          {errors.termsAccepted}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ETAPA 3 - Endereço */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* CEP */}
                    <div className="space-y-1">
                      <label
                        htmlFor="cep"
                        className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-dark)]"
                      >
                        <MapPin
                          size={16}
                          weight="fill"
                          className="text-[var(--color-text-medium)]"
                        />
                        CEP
                      </label>
                      <div className="relative">
                        <input
                          id="cep"
                          type="text"
                          maxLength={9}
                          value={formData.address.cep}
                          onChange={handleCepChange}
                          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                            errors.cep
                              ? "border-[var(--color-roc-danger)] focus:ring-2 focus:ring-[var(--color-roc-danger)]/20"
                              : "border-[var(--color-border)] focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                          }`}
                          placeholder="00000-000"
                        />
                        {isFetchingCep && (
                          <SpinnerGap
                            size={20}
                            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[var(--color-roc-primary)]"
                          />
                        )}
                      </div>
                      {errors.cep && (
                        <p className="text-xs text-[var(--color-roc-danger)]">{errors.cep}</p>
                      )}
                      <p className="text-xs text-[var(--color-text-medium)]">
                        Digite o CEP para preencher o endereço automaticamente.
                      </p>
                    </div>

                    {/* Rua e Número */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2 space-y-1">
                        <label
                          htmlFor="street"
                          className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-dark)]"
                        >
                          <House
                            size={16}
                            weight="fill"
                            className="text-[var(--color-text-medium)]"
                          />
                          Rua
                        </label>
                        <input
                          id="street"
                          type="text"
                          value={formData.address.street}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              address: { ...formData.address, street: e.target.value },
                            });
                            if (errors.street) setErrors({ ...errors, street: "" });
                          }}
                          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                            errors.street
                              ? "border-[var(--color-roc-danger)] focus:ring-2 focus:ring-[var(--color-roc-danger)]/20"
                              : "border-[var(--color-border)] focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                          }`}
                          placeholder="Nome da rua"
                        />
                        {errors.street && (
                          <p className="text-xs text-[var(--color-roc-danger)]">{errors.street}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor="number"
                          className="text-sm font-medium text-[var(--color-text-dark)]"
                        >
                          Número
                        </label>
                        <input
                          id="number"
                          type="text"
                          value={formData.address.number}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              address: { ...formData.address, number: e.target.value },
                            });
                            if (errors.number) setErrors({ ...errors, number: "" });
                          }}
                          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                            errors.number
                              ? "border-[var(--color-roc-danger)] focus:ring-2 focus:ring-[var(--color-roc-danger)]/20"
                              : "border-[var(--color-border)] focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                          }`}
                          placeholder="123"
                        />
                        {errors.number && (
                          <p className="text-xs text-[var(--color-roc-danger)]">{errors.number}</p>
                        )}
                      </div>
                    </div>

                    {/* Complemento */}
                    <div className="space-y-1">
                      <label
                        htmlFor="complement"
                        className="text-sm font-medium text-[var(--color-text-dark)]"
                      >
                        Complemento{" "}
                        <span className="font-normal text-[var(--color-text-medium)]">
                          (opcional)
                        </span>
                      </label>
                      <input
                        id="complement"
                        type="text"
                        value={formData.address.complement}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            address: { ...formData.address, complement: e.target.value },
                          })
                        }
                        className="w-full rounded-xl border border-[var(--color-border)] px-4 py-3 text-sm outline-none transition-all focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                        placeholder="Apto, Bloco, etc."
                      />
                    </div>

                    {/* Bairro */}
                    <div className="space-y-1">
                      <label
                        htmlFor="neighborhood"
                        className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-dark)]"
                      >
                        <Buildings
                          size={16}
                          weight="fill"
                          className="text-[var(--color-text-medium)]"
                        />
                        Bairro
                      </label>
                      <input
                        id="neighborhood"
                        type="text"
                        value={formData.address.neighborhood}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            address: { ...formData.address, neighborhood: e.target.value },
                          });
                          if (errors.neighborhood) setErrors({ ...errors, neighborhood: "" });
                        }}
                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                          errors.neighborhood
                            ? "border-[var(--color-roc-danger)] focus:ring-2 focus:ring-[var(--color-roc-danger)]/20"
                            : "border-[var(--color-border)] focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                        }`}
                        placeholder="Nome do bairro"
                      />
                      {errors.neighborhood && (
                        <p className="text-xs text-[var(--color-roc-danger)]">
                          {errors.neighborhood}
                        </p>
                      )}
                    </div>

                    {/* Cidade e Estado */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2 space-y-1">
                        <label
                          htmlFor="city"
                          className="text-sm font-medium text-[var(--color-text-dark)]"
                        >
                          Cidade
                        </label>
                        <input
                          id="city"
                          type="text"
                          value={formData.address.city}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              address: { ...formData.address, city: e.target.value },
                            });
                            if (errors.city) setErrors({ ...errors, city: "" });
                          }}
                          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                            errors.city
                              ? "border-[var(--color-roc-danger)] focus:ring-2 focus:ring-[var(--color-roc-danger)]/20"
                              : "border-[var(--color-border)] focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                          }`}
                          placeholder="Sua cidade"
                        />
                        {errors.city && (
                          <p className="text-xs text-[var(--color-roc-danger)]">{errors.city}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor="state"
                          className="text-sm font-medium text-[var(--color-text-dark)]"
                        >
                          Estado
                        </label>
                        <input
                          id="state"
                          type="text"
                          maxLength={2}
                          value={formData.address.state}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              address: { ...formData.address, state: e.target.value.toUpperCase() },
                            });
                            if (errors.state) setErrors({ ...errors, state: "" });
                          }}
                          className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                            errors.state
                              ? "border-[var(--color-roc-danger)] focus:ring-2 focus:ring-[var(--color-roc-danger)]/20"
                              : "border-[var(--color-border)] focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                          }`}
                          placeholder="RO"
                        />
                        {errors.state && (
                          <p className="text-xs text-[var(--color-roc-danger)]">{errors.state}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botões de navegação */}
              <div className="flex gap-3 pt-4">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--color-text-dark)] transition-all hover:bg-[var(--color-bg-light)]"
                  >
                    <ArrowLeft size={18} weight="bold" />
                    Voltar
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-roc-primary)] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--color-roc-primary-dark)] disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <SpinnerGap size={18} className="animate-spin" />
                      Processando...
                    </>
                  ) : currentStep === 3 ? (
                    <>
                      Finalizar cadastro
                      <Check size={18} weight="bold" />
                    </>
                  ) : (
                    <>
                      Continuar
                      <ArrowRight size={18} weight="bold" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Link para login */}
            <p className="mt-6 text-center text-sm text-[var(--color-text-medium)]">
              Já tem uma conta?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-[var(--color-roc-primary)] hover:underline"
              >
                Fazer login
              </Link>
            </p>
          </div>

          {/* Indicador de segurança */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--color-text-medium)]">
            <ShieldCheck size={16} weight="fill" className="text-[var(--color-roc-success)]" />
            <span>Seus dados estão protegidos com criptografia SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
