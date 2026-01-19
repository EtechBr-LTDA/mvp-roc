"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import { Header } from "../../../components/Header";
import { Footer } from "../../../components/Footer";
import {
  ArrowLeft,
  CheckCircle,
  WarningCircle,
  ForkKnife,
  MapPin,
  X,
  Timer,
  ShieldCheck,
  Gift,
  Copy,
  Check,
  Star,
  Users,
  Phone,
  NavigationArrow,
  Info,
  Sparkle,
  CalendarCheck,
  Receipt,
} from "@phosphor-icons/react";

interface VoucherDetail {
  id: string;
  code: string;
  used: boolean;
  restaurant: {
    id?: string;
    name: string;
    city: string;
    category?: string;
    discount?: string;
    imageUrl?: string | null;
    description?: string;
    address?: string;
    phone?: string;
    rating?: number;
    reviewCount?: number;
    redemptionCount?: number;
    offer?: {
      title: string;
      description: string;
      rules: string[];
      benefits: string[];
      validity: string;
    };
    logo?: string;
  };
}

// Timer de 10 minutos em segundos
const COUPON_VALIDITY_SECONDS = 10 * 60;

export default function VoucherPage() {
  const params = useParams<{ id: string }>();
  const voucherId = params.id;

  const [voucher, setVoucher] = useState<VoucherDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(COUPON_VALIDITY_SECONDS);
  const [isExpired, setIsExpired] = useState(false);

  // Buscar dados do voucher
  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("auth_token");
        const userId = localStorage.getItem("user_id");

        const headers: HeadersInit = {
          "Content-Type": "application/json",
        };

        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        if (userId) {
          headers["x-user-id"] = userId;
        }

        const response = await fetch(`/api/vouchers/${voucherId}`, {
          headers,
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Erro desconhecido" }));
          throw new Error(errorData.error || "Erro ao carregar voucher");
        }

        const data = await response.json();

        setVoucher({
          ...data,
          restaurant: {
            ...data.restaurant,
            category: data.restaurant?.category || "Gastronomia",
            discount: data.restaurant?.discount || "10% OFF",
            description: data.restaurant?.description || "Experimente o melhor da gastronomia local com desconto exclusivo do ROC Passaporte.",
            address: data.restaurant?.address || "Centro, " + (data.restaurant?.city || "Porto Velho") + " - RO",
            phone: data.restaurant?.phone || "(69) 99999-9999",
            rating: data.restaurant?.rating || 4.8,
            reviewCount: data.restaurant?.reviewCount || 127,
            redemptionCount: data.restaurant?.redemptionCount || 856,
            logo: "🍽️",
            offer: {
              title: "Desconto Exclusivo ROC Passaporte",
              description:
                "Apresente o cupom ao garçom ou caixa na hora do pagamento para validar seu desconto.",
              benefits: [
                "Válido de segunda a domingo",
                "Válido até 31/12/2024",
                "Desconto aplicado na conta total",
              ],
              rules: [
                "Válido apenas para consumo no local",
                "Não acumulativo com outras promoções",
                "Limite de 1 uso por visita",
              ],
              validity: "Válido até 31/12/2024",
            },
          },
        });
      } catch (err: any) {
        setError(err.message || "Erro ao carregar voucher");
        console.error("Erro ao buscar voucher:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (voucherId) {
      fetchVoucher();
    }
  }, [voucherId]);

  // Timer do cupom
  useEffect(() => {
    if (!showCoupon || isExpired) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showCoupon, isExpired]);

  // Gerar QR Code quando o cupom for gerado
  useEffect(() => {
    if (showCoupon && voucher && !isExpired) {
      // QR Code contém apenas o código do voucher para facilitar validação
      QRCode.toDataURL(voucher.code, {
        errorCorrectionLevel: "H",
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
        .then((url) => {
          setQrDataUrl(url);
        })
        .catch((err) => {
          console.error("Erro ao gerar QR Code:", err);
        });
    }
  }, [showCoupon, voucher, isExpired]);

  // Formatar tempo restante
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Cor do timer baseada no tempo restante
  const getTimerColor = useCallback(() => {
    if (timeRemaining <= 60) return "text-[var(--color-roc-danger)]";
    if (timeRemaining <= 180) return "text-[var(--color-roc-accent)]";
    return "text-[var(--color-roc-success)]";
  }, [timeRemaining]);

  const handleOpenConfirmModal = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmGenerate = () => {
    setShowConfirmModal(false);
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowCoupon(true);
      setTimeRemaining(COUPON_VALIDITY_SECONDS);
      setIsExpired(false);
    }, 1500);
  };

  const handleCopyCode = () => {
    if (voucher?.code) {
      navigator.clipboard.writeText(voucher.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerateCoupon = () => {
    setShowCoupon(false);
    setIsExpired(false);
    setTimeRemaining(COUPON_VALIDITY_SECONDS);
    setQrDataUrl("");
    handleOpenConfirmModal();
  };

  // Extrair número do desconto
  const getDiscountNumber = (label: string): number => {
    const match = label.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 10;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--color-bg-light)]">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-roc-primary)]" />
            <p className="text-[var(--color-text-medium)]">
              Carregando voucher...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !voucher) {
    return (
      <div className="flex min-h-screen flex-col bg-[var(--color-bg-light)]">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-roc-danger)]/10">
              <WarningCircle
                size={32}
                weight="fill"
                className="text-[var(--color-roc-danger)]"
              />
            </div>
            <p className="mb-4 text-lg text-[var(--color-text-dark)]">
              {error || "Voucher não encontrado"}
            </p>
            <Link
              href="/account/vouchers"
              className="inline-flex items-center gap-2 text-[var(--color-roc-primary)] hover:underline"
            >
              <ArrowLeft size={18} />
              Voltar aos vouchers
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const restaurant = voucher.restaurant;
  const discountNumber = getDiscountNumber(restaurant.discount || "10% OFF");

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-light)]">
      <Header />

      <main className="flex-1 pb-12 pt-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          {/* Voltar */}
          <Link
            href="/account/vouchers"
            className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-text-dark)]"
          >
            <ArrowLeft size={20} weight="bold" />
            Voltar aos meus cupons
          </Link>

          {/* Hero Section - Imagem de Destaque */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-8 overflow-hidden rounded-3xl"
          >
            {/* Imagem de Fundo */}
            <div className="relative aspect-[21/9] overflow-hidden bg-gradient-to-br from-[var(--color-roc-primary)] to-[var(--color-roc-primary-dark)]">
              {restaurant.imageUrl ? (
                <>
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="h-full w-full object-cover"
                  />
                  {/* Overlay Gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                </>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="text-9xl opacity-30">{restaurant.logo || "🍽️"}</span>
                </div>
              )}

              {/* Conteúdo do Hero */}
              <div className="absolute inset-0 flex items-center">
                <div className="px-6 py-8 md:px-12 lg:px-16">
                  {/* Badge Exclusivo */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm"
                  >
                    <Sparkle size={16} weight="fill" className="text-yellow-400" />
                    <span className="text-sm font-medium text-white">Oferta Exclusiva ROC Passaporte</span>
                  </motion.div>

                  {/* Título com Desconto */}
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-3 text-3xl font-bold text-white md:text-4xl lg:text-5xl"
                  >
                    <span className="text-[var(--color-roc-accent)]">{restaurant.discount}</span> na{" "}
                    {restaurant.name}
                  </motion.h1>

                  {/* Subtítulo */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-6 max-w-xl text-base text-white/80 md:text-lg"
                  >
                    {restaurant.description}
                  </motion.p>

                  {/* Tags */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap items-center gap-3"
                  >
                    {restaurant.category && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm text-white backdrop-blur-sm">
                        <ForkKnife size={14} weight="fill" />
                        {restaurant.category}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm text-white backdrop-blur-sm">
                      <MapPin size={14} weight="fill" />
                      {restaurant.city}
                    </span>
                    {restaurant.rating && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/20 px-3 py-1.5 text-sm text-white backdrop-blur-sm">
                        <Star size={14} weight="fill" className="text-yellow-400" />
                        {restaurant.rating} ({restaurant.reviewCount} avaliações)
                      </span>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Badge de Desconto Grande (Desktop) */}
              <div className="absolute right-8 top-8 hidden lg:block">
                <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[var(--color-roc-primary)] text-white shadow-2xl">
                  <span className="text-4xl font-bold">{discountNumber}%</span>
                  <span className="text-sm font-medium">OFF</span>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Coluna Esquerda - Detalhes */}
            <div className="space-y-6 lg:col-span-2">
              {/* Prova Social */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-3 gap-4"
              >
                <div className="rounded-2xl bg-white p-4 text-center shadow-soft">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                    <Star size={24} weight="fill" className="text-yellow-500" />
                  </div>
                  <p className="text-2xl font-bold text-[var(--color-text-dark)]">{restaurant.rating}</p>
                  <p className="text-xs text-[var(--color-text-medium)]">{restaurant.reviewCount} avaliações</p>
                </div>
                <div className="rounded-2xl bg-white p-4 text-center shadow-soft">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Users size={24} weight="fill" className="text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-[var(--color-text-dark)]">{restaurant.redemptionCount}+</p>
                  <p className="text-xs text-[var(--color-text-medium)]">cupons resgatados</p>
                </div>
                <div className="rounded-2xl bg-white p-4 text-center shadow-soft">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-roc-primary)]/10">
                    <Receipt size={24} weight="fill" className="text-[var(--color-roc-primary)]" />
                  </div>
                  <p className="text-2xl font-bold text-[var(--color-text-dark)]">R$ {discountNumber * 2}</p>
                  <p className="text-xs text-[var(--color-text-medium)]">economia média</p>
                </div>
              </motion.div>

              {/* Como Funciona */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl bg-white p-6 shadow-soft"
              >
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[var(--color-text-dark)]">
                  <Gift size={22} weight="fill" className="text-[var(--color-roc-primary)]" />
                  Como usar seu cupom
                </h2>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-roc-primary)] text-sm font-bold text-white">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text-dark)]">Resgate o Cupom</p>
                      <p className="text-sm text-[var(--color-text-medium)]">Clique no botão e gere seu código exclusivo</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-roc-primary)] text-sm font-bold text-white">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text-dark)]">Apresente ao Garçom</p>
                      <p className="text-sm text-[var(--color-text-medium)]">Mostre o QR Code ou código na hora do pagamento</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-roc-primary)] text-sm font-bold text-white">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text-dark)]">Aproveite o Desconto</p>
                      <p className="text-sm text-[var(--color-text-medium)]">O desconto será aplicado automaticamente</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Benefícios e Regras */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl bg-white p-6 shadow-soft"
              >
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Benefícios */}
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-[var(--color-text-dark)]">
                      <CheckCircle size={20} weight="fill" className="text-[var(--color-roc-success)]" />
                      Benefícios
                    </h3>
                    <ul className="space-y-3">
                      {restaurant.offer?.benefits.map((benefit, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-sm"
                        >
                          <CheckCircle
                            size={18}
                            weight="fill"
                            className="mt-0.5 flex-shrink-0 text-[var(--color-roc-success)]"
                          />
                          <span className="text-[var(--color-text-medium)]">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Regras */}
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 font-semibold text-[var(--color-text-dark)]">
                      <Info size={20} weight="fill" className="text-[var(--color-roc-accent)]" />
                      Termos de Uso
                    </h3>
                    <ul className="space-y-3">
                      {restaurant.offer?.rules.map((rule, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-sm"
                        >
                          <WarningCircle
                            size={18}
                            weight="fill"
                            className="mt-0.5 flex-shrink-0 text-[var(--color-roc-accent)]"
                          />
                          <span className="text-[var(--color-text-medium)]">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Validade em Destaque */}
                <div className="mt-6 flex items-center gap-3 rounded-xl bg-[var(--color-roc-primary)]/5 p-4">
                  <CalendarCheck size={24} weight="fill" className="text-[var(--color-roc-primary)]" />
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-dark)]">Validade da Oferta</p>
                    <p className="text-sm text-[var(--color-text-medium)]">{restaurant.offer?.validity}</p>
                  </div>
                </div>
              </motion.div>

              {/* Informações do Estabelecimento */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-2xl bg-white p-6 shadow-soft"
              >
                <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-[var(--color-text-dark)]">
                  <MapPin size={22} weight="fill" className="text-[var(--color-roc-primary)]" />
                  Localização e Contato
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-light)]">
                      <MapPin size={20} weight="fill" className="text-[var(--color-roc-primary)]" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text-dark)]">Endereço</p>
                      <p className="text-sm text-[var(--color-text-medium)]">{restaurant.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-light)]">
                      <Phone size={20} weight="fill" className="text-[var(--color-roc-primary)]" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text-dark)]">Telefone</p>
                      <a
                        href={`tel:${restaurant.phone}`}
                        className="text-sm text-[var(--color-roc-primary)] hover:underline"
                      >
                        {restaurant.phone}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Botão de Navegação */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + " " + restaurant.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--color-bg-light)] px-4 py-3 text-sm font-medium text-[var(--color-text-dark)] transition-all hover:bg-[var(--color-border)]"
                >
                  <NavigationArrow size={18} weight="fill" className="text-[var(--color-roc-primary)]" />
                  Abrir no Google Maps
                </a>
              </motion.div>
            </div>

            {/* Coluna Direita - CTA Fixo */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-28">
                {/* Card de Resgate do Cupom */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-medium">
                  {showCoupon ? (
                    /* Cupom Gerado */
                    <div className="p-6 text-center">
                      {/* Timer */}
                      <div
                        className={`mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 ${
                          isExpired
                            ? "bg-[var(--color-roc-danger)]/10"
                            : timeRemaining <= 60
                            ? "bg-[var(--color-roc-danger)]/10"
                            : "bg-[var(--color-roc-success)]/10"
                        }`}
                      >
                        <Timer size={20} weight="fill" className={getTimerColor()} />
                        <span className={`font-mono text-lg font-bold ${getTimerColor()}`}>
                          {isExpired ? "Expirado" : formatTime(timeRemaining)}
                        </span>
                      </div>

                      {isExpired ? (
                        /* Cupom Expirado */
                        <>
                          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-roc-danger)]/10">
                            <WarningCircle
                              size={40}
                              weight="fill"
                              className="text-[var(--color-roc-danger)]"
                            />
                          </div>
                          <h2 className="mb-2 text-xl font-bold text-[var(--color-text-dark)]">
                            Cupom Expirado
                          </h2>
                          <p className="mb-6 text-sm text-[var(--color-text-medium)]">
                            O tempo de validade do cupom terminou. Gere um novo
                            cupom para utilizar seu desconto.
                          </p>
                          <button
                            onClick={handleRegenerateCoupon}
                            className="w-full rounded-xl bg-[var(--color-roc-primary)] py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--color-roc-primary-dark)]"
                          >
                            Gerar Novo Cupom
                          </button>
                        </>
                      ) : (
                        /* Cupom Ativo */
                        <>
                          <h2 className="mb-2 text-xl font-bold text-[var(--color-text-dark)]">
                            Cupom Ativo!
                          </h2>
                          <p className="mb-4 text-sm text-[var(--color-text-medium)]">
                            Mostre este código ao garçom/caixa
                          </p>

                          {/* QR Code */}
                          {qrDataUrl && (
                            <div className="mb-4 inline-block rounded-xl border-2 border-[var(--color-border)] p-3">
                              <img
                                src={qrDataUrl}
                                alt="QR Code"
                                className="h-[180px] w-[180px]"
                              />
                            </div>
                          )}

                          {/* Código */}
                          <div className="mb-4 rounded-xl bg-[var(--color-bg-light)] p-4">
                            <p className="mb-1 text-xs text-[var(--color-text-medium)]">
                              Código do cupom
                            </p>
                            <div className="flex items-center justify-center gap-3">
                              <span className="font-mono text-2xl font-bold tracking-widest text-[var(--color-text-dark)]">
                                {voucher.code}
                              </span>
                              <button
                                onClick={handleCopyCode}
                                className="rounded-lg p-2 text-[var(--color-text-medium)] transition-colors hover:bg-white hover:text-[var(--color-roc-primary)]"
                                title="Copiar código"
                              >
                                {copied ? (
                                  <Check
                                    size={20}
                                    weight="bold"
                                    className="text-[var(--color-roc-success)]"
                                  />
                                ) : (
                                  <Copy size={20} />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Aviso */}
                          <div className="flex items-start gap-2 rounded-lg bg-[var(--color-roc-accent)]/10 p-3 text-left">
                            <WarningCircle
                              size={18}
                              weight="fill"
                              className="mt-0.5 flex-shrink-0 text-[var(--color-roc-accent)]"
                            />
                            <p className="text-xs text-[var(--color-text-medium)]">
                              Este cupom expira em{" "}
                              <strong>{formatTime(timeRemaining)}</strong>.
                              Apresente-o antes que o tempo acabe.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    /* Botão para Gerar Cupom */
                    <div className="p-6 text-center">
                      {/* Badge de Desconto */}
                      <div className="mx-auto mb-4 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-gradient-to-br from-[var(--color-roc-primary)] to-[var(--color-roc-primary-dark)] text-white shadow-lg">
                        <span className="text-3xl font-bold">{discountNumber}%</span>
                        <span className="text-xs font-medium">OFF</span>
                      </div>

                      <h2 className="mb-2 text-xl font-bold text-[var(--color-text-dark)]">
                        Pronto para economizar?
                      </h2>

                      <p className="mb-2 text-sm text-[var(--color-text-medium)]">
                        Resgate seu cupom exclusivo de{" "}
                        <strong className="text-[var(--color-roc-primary)]">
                          {restaurant.discount}
                        </strong>{" "}
                        agora!
                      </p>

                      <p className="mb-6 flex items-center justify-center gap-1 text-xs text-[var(--color-text-medium)]">
                        <Timer size={14} weight="fill" />
                        Validade: 10 minutos após geração
                      </p>

                      <button
                        onClick={handleOpenConfirmModal}
                        disabled={isGenerating}
                        className="w-full rounded-xl bg-[var(--color-roc-primary)] py-4 text-base font-semibold text-white transition-all hover:bg-[var(--color-roc-primary-dark)] hover:shadow-lg disabled:opacity-50"
                      >
                        {isGenerating ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg
                              className="h-5 w-5 animate-spin"
                              viewBox="0 0 24 24"
                              fill="none"
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
                            Gerando cupom...
                          </span>
                        ) : (
                          "RESGATAR CUPOM AGORA"
                        )}
                      </button>

                      {/* Segurança */}
                      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--color-text-medium)]">
                        <ShieldCheck
                          size={14}
                          weight="fill"
                          className="text-[var(--color-roc-success)]"
                        />
                        <span>Cupom único e intransferível</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* CTA Secundário */}
                <div className="mt-4 rounded-2xl bg-[var(--color-roc-primary)]/5 p-4 text-center">
                  <p className="text-xs text-[var(--color-text-medium)]">
                    Dúvidas sobre a oferta?
                  </p>
                  <a
                    href={`tel:${restaurant.phone}`}
                    className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-[var(--color-roc-primary)] hover:underline"
                  >
                    <Phone size={14} weight="fill" />
                    Ligue para o restaurante
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Modal de Confirmação */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[var(--color-text-dark)]">
                  Confirmar Resgate
                </h2>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="rounded-lg p-1 text-[var(--color-text-medium)] hover:bg-[var(--color-bg-light)]"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6">
                <div className="mb-4 rounded-xl bg-[var(--color-bg-light)] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-roc-primary)]/10">
                      <Gift
                        size={24}
                        weight="fill"
                        className="text-[var(--color-roc-primary)]"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--color-text-dark)]">
                        {restaurant.name}
                      </p>
                      <p className="text-sm text-[var(--color-roc-primary)]">
                        {restaurant.discount}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mb-4 text-sm text-[var(--color-text-medium)]">
                  Ao confirmar, seu cupom será gerado e terá validade de{" "}
                  <strong>10 minutos</strong>. Certifique-se de que você está no
                  restaurante antes de continuar.
                </p>

                <div className="flex items-start gap-2 rounded-lg bg-[var(--color-roc-accent)]/10 p-3">
                  <WarningCircle
                    size={18}
                    weight="fill"
                    className="mt-0.5 flex-shrink-0 text-[var(--color-roc-accent)]"
                  />
                  <p className="text-xs text-[var(--color-text-medium)]">
                    <strong>Importante:</strong> Apresente o cupom ao
                    garçom/caixa na hora do pagamento para validar seu desconto.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 rounded-xl border border-[var(--color-border)] py-3 text-sm font-semibold text-[var(--color-text-dark)] transition-all hover:bg-[var(--color-bg-light)]"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmGenerate}
                  className="flex-1 rounded-xl bg-[var(--color-roc-primary)] py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--color-roc-primary-dark)]"
                >
                  Confirmar e Gerar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
