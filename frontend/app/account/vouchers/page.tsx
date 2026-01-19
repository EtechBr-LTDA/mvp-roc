"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import {
  MapPin,
  Gift,
  CheckCircle,
  MagnifyingGlass,
  ForkKnife,
  Funnel,
  CaretDown,
  Question,
  X,
  Sparkle,
  Clock,
  ArrowRight,
} from "@phosphor-icons/react";
import { supabase } from "@/app/lib/supabase";
import { apiClient } from "@/app/lib/api";

// Tipos de cozinha disponíveis
const cuisineTypes = [
  "Todas",
  "Brasileira",
  "Italiana",
  "Japonesa",
  "Churrascaria",
  "Pizzaria",
  "Cafeteria",
  "Fast Food",
  "Contemporânea",
  "Árabe",
  "Mexicana",
  "Francesa",
  "Vegetariana",
];

// Faixas de desconto
const discountRanges = [
  { label: "Todos", min: 0, max: 100 },
  { label: "10% ou mais", min: 10, max: 100 },
  { label: "15% ou mais", min: 15, max: 100 },
  { label: "20% ou mais", min: 20, max: 100 },
  { label: "25% ou mais", min: 25, max: 100 },
  { label: "30% ou mais", min: 30, max: 100 },
];

// Status do voucher
const statusOptions = [
  { label: "Todos", value: "all" },
  { label: "Disponíveis", value: "available" },
  { label: "Utilizados", value: "used" },
];

interface Voucher {
  id: string;
  code: string;
  restaurantName: string;
  city: string;
  discountLabel: string;
  used: boolean;
  imageUrl: string;
  category?: string;
}

export default function VouchersPage() {
  const [user, setUser] = useState<{ name: string }>({ name: "Usuário" });
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("Todas");
  const [selectedDiscount, setSelectedDiscount] = useState<number>(0);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Notificação de validação em tempo real
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    voucherCode?: string;
    restaurantName?: string;
  }>({ show: false, message: "" });

  // Função para buscar vouchers (extraída para poder ser reutilizada)
  const fetchVouchers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");

      if (!token) {
        window.location.href = "/auth/login";
        return;
      }

      // Buscar nome do usuário do localStorage
      const userName = localStorage.getItem("user_name");
      if (userName) {
        // Extrair apenas o primeiro nome
        const firstName = userName.split(" ")[0];
        setUser({ name: firstName });
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const response = await fetch("/api/vouchers", {
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          window.location.href = "/auth/login";
          return;
        }
        throw new Error(errorData.error || "Erro ao carregar vouchers");
      }

      const data = await response.json();

      const normalized: Voucher[] =
        data.vouchers?.map((voucher: any) => ({
          id: voucher.id,
          code: voucher.code,
          restaurantName: voucher.restaurantName,
          city: voucher.city,
          discountLabel: voucher.discountLabel,
          used: voucher.used,
          imageUrl: voucher.imageUrl,
          category: voucher.category || "Gastronomia",
        })) ?? [];

      setVouchers(normalized);
    } catch (err) {
      console.error(err);
      setError("Não foi possível carregar seus vouchers. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();

    // Configurar Realtime subscription para notificações em tempo real
    const userId = apiClient.getUserId();
    if (!userId || !supabase) {
      return;
    }

    // Escutar mudanças na tabela vouchers para este usuário
    const channel = supabase
      .channel(`vouchers:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "vouchers",
          filter: `profile_id=eq.${userId}`,
        },
        async (payload) => {
          const updatedVoucher = payload.new as any;
          const oldVoucher = payload.old as any;

          // Verificar se o voucher foi marcado como usado (mudou de available para used)
          if (
            updatedVoucher.status === "used" &&
            oldVoucher.status === "available" &&
            updatedVoucher.used_at
          ) {
            // Buscar informações atualizadas do voucher para a notificação
            const token = localStorage.getItem("auth_token");
            if (token) {
              try {
                const response = await fetch("/api/vouchers", {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                });
                if (response.ok) {
                  const data = await response.json();
                  const updatedVoucherData = data.vouchers?.find(
                    (v: any) => v.id === updatedVoucher.id
                  );

                  // Atualizar lista de vouchers
                  await fetchVouchers();

                  // Mostrar notificação
                  setNotification({
                    show: true,
                    message: `Seu voucher foi validado!`,
                    voucherCode: updatedVoucher.code,
                    restaurantName:
                      updatedVoucherData?.restaurantName || "Restaurante",
                  });

                  // Esconder notificação após 5 segundos
                  setTimeout(() => {
                    setNotification({ show: false, message: "" });
                  }, 5000);
                }
              } catch (err) {
                console.error("Erro ao buscar dados do voucher:", err);
                // Mesmo assim, atualizar a lista e mostrar notificação básica
                await fetchVouchers();
                setNotification({
                  show: true,
                  message: `Seu voucher ${updatedVoucher.code} foi validado!`,
                  voucherCode: updatedVoucher.code,
                });
                setTimeout(() => {
                  setNotification({ show: false, message: "" });
                }, 5000);
              }
            }
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      if (supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Extrair lista de cidades únicas
  const cities = Array.from(new Set(vouchers.map((v) => v.city))).sort();

  // Extrair número do desconto
  const getDiscountNumber = (label: string): number => {
    const match = label.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Filtrar vouchers
  const filteredVouchers = vouchers.filter((voucher) => {
    const matchesSearch =
      !searchTerm ||
      voucher.restaurantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = !selectedCity || voucher.city === selectedCity;

    const matchesCuisine =
      selectedCuisine === "Todas" || voucher.category === selectedCuisine;

    const discountNum = getDiscountNumber(voucher.discountLabel);
    const matchesDiscount = discountNum >= selectedDiscount;

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "available" && !voucher.used) ||
      (selectedStatus === "used" && voucher.used);

    return (
      matchesSearch &&
      matchesCity &&
      matchesCuisine &&
      matchesDiscount &&
      matchesStatus
    );
  });

  // Contadores
  const totalVouchers = vouchers.length;
  const availableCount = vouchers.filter((v) => !v.used).length;
  const usedCount = vouchers.filter((v) => v.used).length;

  // Limpar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCity("");
    setSelectedCuisine("Todas");
    setSelectedDiscount(0);
    setSelectedStatus("all");
  };

  const hasActiveFilters =
    searchTerm ||
    selectedCity ||
    selectedCuisine !== "Todas" ||
    selectedDiscount > 0 ||
    selectedStatus !== "all";

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-light)]">
      <Header />

      {/* Notificação de validação em tempo real */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed top-4 right-4 z-50 max-w-sm rounded-xl bg-gradient-to-r from-[var(--color-roc-success)] to-[var(--color-roc-success)]/90 p-4 shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <CheckCircle size={24} weight="fill" className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white text-sm">
                  {notification.message}
                </p>
                {notification.restaurantName && (
                  <p className="text-xs text-white/90 mt-1">
                    {notification.restaurantName}
                  </p>
                )}
                {notification.voucherCode && (
                  <p className="text-xs text-white/80 mt-1 font-mono">
                    Código: {notification.voucherCode}
                  </p>
                )}
              </div>
              <button
                onClick={() => setNotification({ show: false, message: "" })}
                className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
                aria-label="Fechar notificação"
              >
                <X size={20} weight="bold" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 pb-12 pt-24">
        <div className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
          {/* Welcome Banner - Painel de Status Otimizado */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-roc-primary)] to-[var(--color-roc-primary-dark)] shadow-medium"
          >
            <div className="px-6 py-6 md:px-8 md:py-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* Saudação e Status */}
                <div className="flex-1">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    <Sparkle size={14} weight="fill" />
                    Passaporte ROC Ativo
                  </div>
                  <h1 className="mb-2 text-2xl font-bold text-white md:text-3xl">
                    Olá, {user.name}!
                  </h1>
                  <p className="text-sm text-white/80 md:text-base">
                    Use o filtro ou a busca para encontrar o restaurante ideal
                    para hoje.
                  </p>
                </div>

                {/* Contadores de Status */}
                <div className="flex flex-wrap gap-3 lg:gap-4">
                  <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                      <Gift size={20} weight="fill" className="text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {availableCount}
                      </p>
                      <p className="text-xs text-white/70">Disponíveis</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                      <CheckCircle
                        size={20}
                        weight="fill"
                        className="text-white"
                      />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {usedCount}
                      </p>
                      <p className="text-xs text-white/70">Utilizados</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Link de Ajuda */}
              <button
                onClick={() => setShowHelpModal(true)}
                className="mt-4 inline-flex items-center gap-2 text-sm text-white/80 transition-colors hover:text-white"
              >
                <Question size={16} weight="fill" />
                Como usar meu cupom?
              </button>
            </div>
          </motion.div>

          {/* Barra de Busca e Filtros */}
          <div className="mb-6 space-y-4">
            {/* Busca Principal */}
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <MagnifyingGlass className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-medium)]" />
                <input
                  type="text"
                  placeholder="Buscar por nome do restaurante ou tipo de cozinha..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-white py-3 pl-12 pr-4 text-sm outline-none transition-all focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  showFilters || hasActiveFilters
                    ? "border-[var(--color-roc-primary)] bg-[var(--color-roc-primary)]/10 text-[var(--color-roc-primary)]"
                    : "border-[var(--color-border)] bg-white text-[var(--color-text-medium)] hover:border-[var(--color-roc-primary)]"
                }`}
              >
                <Funnel size={18} weight={showFilters ? "fill" : "regular"} />
                Filtros
                {hasActiveFilters && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-roc-primary)] text-xs text-white">
                    !
                  </span>
                )}
              </button>
            </div>

            {/* Filtros Avançados */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white p-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Filtro por Cidade */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-medium)]">
                        Cidade
                      </label>
                      <div className="relative">
                        <select
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(e.target.value)}
                          className="w-full appearance-none rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 pr-8 text-sm outline-none focus:border-[var(--color-roc-primary)]"
                        >
                          <option value="">Todas as cidades</option>
                          {cities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                        <CaretDown
                          size={16}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-medium)]"
                        />
                      </div>
                    </div>

                    {/* Filtro por Tipo de Cozinha */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-medium)]">
                        Tipo de Cozinha
                      </label>
                      <div className="relative">
                        <select
                          value={selectedCuisine}
                          onChange={(e) => setSelectedCuisine(e.target.value)}
                          className="w-full appearance-none rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 pr-8 text-sm outline-none focus:border-[var(--color-roc-primary)]"
                        >
                          {cuisineTypes.map((cuisine) => (
                            <option key={cuisine} value={cuisine}>
                              {cuisine}
                            </option>
                          ))}
                        </select>
                        <CaretDown
                          size={16}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-medium)]"
                        />
                      </div>
                    </div>

                    {/* Filtro por Desconto */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-medium)]">
                        Desconto Mínimo
                      </label>
                      <div className="relative">
                        <select
                          value={selectedDiscount}
                          onChange={(e) =>
                            setSelectedDiscount(Number(e.target.value))
                          }
                          className="w-full appearance-none rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 pr-8 text-sm outline-none focus:border-[var(--color-roc-primary)]"
                        >
                          {discountRanges.map((range) => (
                            <option key={range.label} value={range.min}>
                              {range.label}
                            </option>
                          ))}
                        </select>
                        <CaretDown
                          size={16}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-medium)]"
                        />
                      </div>
                    </div>

                    {/* Filtro por Status */}
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-[var(--color-text-medium)]">
                        Status do Cupom
                      </label>
                      <div className="relative">
                        <select
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                          className="w-full appearance-none rounded-lg border border-[var(--color-border)] bg-white px-3 py-2.5 pr-8 text-sm outline-none focus:border-[var(--color-roc-primary)]"
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <CaretDown
                          size={16}
                          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-medium)]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Limpar Filtros */}
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-sm font-medium text-[var(--color-roc-primary)] hover:underline"
                    >
                      Limpar todos os filtros
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Resultados */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[var(--color-text-medium)]">
              {filteredVouchers.length}{" "}
              {filteredVouchers.length === 1
                ? "restaurante encontrado"
                : "restaurantes encontrados"}
            </p>
          </div>

          {/* Vouchers Grid */}
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-roc-primary)]" />
              <p className="text-[var(--color-text-medium)]">
                Carregando seus vouchers...
              </p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="mb-2 text-[var(--color-text-medium)]">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm font-medium text-[var(--color-roc-primary)] hover:underline"
              >
                Tentar novamente
              </button>
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg-light)]">
                <MagnifyingGlass
                  size={32}
                  className="text-[var(--color-text-medium)]"
                />
              </div>
              <p className="mb-2 text-[var(--color-text-medium)]">
                Nenhum voucher encontrado com os filtros selecionados.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm font-medium text-[var(--color-roc-primary)] hover:underline"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVouchers.map((voucher, index) => (
                <motion.div
                  key={voucher.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={`/account/vouchers/${voucher.id}`}
                    className={`group block overflow-hidden rounded-2xl border-2 bg-white shadow-soft transition-all hover:shadow-medium ${
                      voucher.used
                        ? "border-[var(--color-border)] opacity-70"
                        : "border-[var(--color-border)] hover:border-[var(--color-roc-primary)]"
                    }`}
                  >
                    {/* Imagem */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-bg-light)]">
                      <img
                        src={voucher.imageUrl}
                        alt={voucher.restaurantName}
                        className={`h-full w-full object-cover transition-transform duration-300 ${
                          voucher.used ? "grayscale" : "group-hover:scale-105"
                        }`}
                      />
                      {/* Selo de Desconto - Canto Superior Esquerdo */}
                      <div
                        className={`absolute left-3 top-3 rounded-lg px-3 py-1.5 text-sm font-bold text-white shadow-md ${
                          voucher.used
                            ? "bg-[var(--color-text-medium)]"
                            : "bg-[var(--color-roc-primary)]"
                        }`}
                      >
                        {voucher.discountLabel}
                      </div>
                      {/* Badge de Status */}
                      {voucher.used && (
                        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
                          <CheckCircle size={14} weight="fill" />
                          Utilizado
                        </div>
                      )}
                    </div>

                    {/* Conteúdo do Card */}
                    <div className="p-4">
                      {/* Tag de Categoria */}
                      {voucher.category && (
                        <div className="mb-2 flex items-center gap-1.5">
                          <ForkKnife
                            size={14}
                            weight="fill"
                            className="text-[var(--color-roc-primary)]"
                          />
                          <span className="text-xs font-medium text-[var(--color-text-medium)]">
                            {voucher.category}
                          </span>
                        </div>
                      )}

                      {/* Nome do Restaurante - Mais Proeminente */}
                      <h3
                        className={`mb-2 text-lg font-bold leading-tight ${
                          voucher.used
                            ? "text-[var(--color-text-medium)]"
                            : "text-[var(--color-text-dark)]"
                        }`}
                      >
                        {voucher.restaurantName}
                      </h3>

                      {/* Localização */}
                      <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-medium)]">
                        <MapPin
                          size={16}
                          weight="fill"
                          className={
                            voucher.used
                              ? "text-[var(--color-text-medium)]"
                              : "text-[var(--color-roc-primary)]"
                          }
                        />
                        <span>{voucher.city}</span>
                      </div>

                      {/* Botão de Ação */}
                      {!voucher.used && (
                        <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
                          <span className="text-sm font-medium text-[var(--color-roc-primary)]">
                            Ver detalhes
                          </span>
                          <ArrowRight
                            size={18}
                            weight="bold"
                            className="text-[var(--color-roc-primary)] transition-transform group-hover:translate-x-1"
                          />
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal de Ajuda - Como Usar */}
      <AnimatePresence>
        {showHelpModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowHelpModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-[var(--color-text-dark)]">
                  Como usar meu cupom?
                </h2>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="rounded-lg p-1 text-[var(--color-text-medium)] hover:bg-[var(--color-bg-light)]"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-roc-primary)] text-sm font-bold text-white">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text-dark)]">
                      Escolha o restaurante
                    </h3>
                    <p className="text-sm text-[var(--color-text-medium)]">
                      Use os filtros para encontrar o restaurante ideal e clique
                      em "Ver detalhes".
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-roc-primary)] text-sm font-bold text-white">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text-dark)]">
                      Gere seu cupom
                    </h3>
                    <p className="text-sm text-[var(--color-text-medium)]">
                      Na página do restaurante, clique em "Resgatar Cupom" para
                      gerar seu código exclusivo.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-roc-primary)] text-sm font-bold text-white">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--color-text-dark)]">
                      Apresente no restaurante
                    </h3>
                    <p className="text-sm text-[var(--color-text-medium)]">
                      Mostre o QR Code ou código ao garçom/caixa na hora do
                      pagamento para validar seu desconto.
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-lg bg-[var(--color-roc-accent)]/10 p-3">
                  <Clock
                    size={18}
                    weight="fill"
                    className="mt-0.5 flex-shrink-0 text-[var(--color-roc-accent)]"
                  />
                  <p className="text-sm text-[var(--color-text-medium)]">
                    <strong>Dica:</strong> Gere o cupom apenas quando estiver no
                    restaurante, pois ele tem validade de 10 minutos.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowHelpModal(false)}
                className="mt-6 w-full rounded-xl bg-[var(--color-roc-primary)] py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--color-roc-primary-dark)]"
              >
                Entendi!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
