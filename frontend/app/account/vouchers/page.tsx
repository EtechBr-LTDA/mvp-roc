"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { MapPin, Gift, CheckCircle, MagnifyingGlass } from "@phosphor-icons/react";

const categories = ["Todos", "Porto Velho", "Ji-Paraná", "Ariquemes", "Vilhena", "Cacoal"];

interface Voucher {
  id: string;
  code: string;
  restaurantName: string;
  city: string;
  discountLabel: string;
  used: boolean;
  imageUrl: string;
}

export default function VouchersPage() {
  const [user, setUser] = useState<{ name: string }>({ name: "João Silva" });
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Obter token do localStorage (cliente)
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

        const response = await fetch("/api/vouchers", {
          headers,
        });

        if (!response.ok) {
          throw new Error("Erro ao carregar vouchers");
        }

        const data = await response.json();

        if (data.profile?.name) {
          setUser({ name: data.profile.name });
        }

        const normalized: Voucher[] =
          data.vouchers?.map((voucher: any) => ({
            id: voucher.id,
            code: voucher.code,
            restaurantName: voucher.restaurantName,
            city: voucher.city,
            discountLabel: voucher.discountLabel,
            used: voucher.used,
            imageUrl: voucher.imageUrl,
          })) ?? [];

        setVouchers(normalized);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar seus vouchers. Tente novamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVouchers();
  }, []);

  const cities = Array.from(new Set(vouchers.map((v) => v.city)));

  // Filtrar vouchers
  const filteredVouchers = vouchers.filter((voucher) => {
    const matchesCity = !selectedCity || voucher.city === selectedCity;
    const matchesCategory =
      selectedCategory === "Todos" ||
      (selectedCategory === "Porto Velho" && voucher.city === "Porto Velho") ||
      (selectedCategory === "Ji-Paraná" && voucher.city === "Ji-Paraná") ||
      (selectedCategory === "Ariquemes" && voucher.city === "Ariquemes") ||
      (selectedCategory === "Vilhena" && voucher.city === "Vilhena") ||
      (selectedCategory === "Cacoal" && voucher.city === "Cacoal");
    const matchesSearch =
      !searchTerm ||
      voucher.restaurantName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCity && matchesCategory && matchesSearch;
  });

  const availableCount = filteredVouchers.filter((v) => !v.used).length;
  const usedCount = filteredVouchers.filter((v) => v.used).length;

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-light)]">
      <Header />

      <main className="flex-1 pb-[var(--spacing-5)] pt-24">
        <div className="mx-auto max-w-7xl px-[var(--spacing-4)]">
          {/* Welcome Banner */}
          <div className="mb-[var(--spacing-4)] rounded-2xl bg-[var(--color-roc-primary)] px-[var(--spacing-5)] py-[var(--spacing-4)] text-[var(--color-white)] shadow-soft md:py-[var(--spacing-5)]">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Olá, {user.name}! 👋
            </h1>
            <p className="text-sm md:text-base text-[var(--color-white)]/80">
              Seus vouchers do Passaporte ROC estão prontos para uso. Escolha um restaurante e comece a economizar hoje!
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Gift size={20} weight="fill" />
                <span>{availableCount} disponíveis</span>
              </div>
              {usedCount > 0 && (
                <div className="flex items-center gap-2 text-[var(--color-bg-light)]">
                  <CheckCircle size={20} weight="fill" />
                  <span>{usedCount} utilizados</span>
                </div>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-[var(--spacing-4)] flex flex-col gap-[var(--spacing-3)] md:flex-row">
            <div className="flex-1 relative">
              <MagnifyingGlass className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-medium)]" />
              <input
                type="text"
                placeholder="Buscar restaurantes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] py-3 pl-12 pr-4 text-sm outline-none focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary-light)]/40"
              />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] px-4 py-3 text-sm outline-none focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary-light)]/40"
            >
              <option value="">Todas as cidades</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Categories */}
          <div className="mb-[var(--spacing-4)] flex gap-[var(--spacing-2)] overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors text-sm font-medium ${
                  selectedCategory === category
                    ? "bg-[var(--color-roc-primary)] text-[var(--color-white)]"
                    : "border border-[var(--color-border)] bg-[var(--color-white)] text-[var(--color-text-medium)] hover:bg-[var(--color-bg-light)]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Vouchers Grid */}
          {isLoading ? (
            <div className="py-12 text-center">
              <p className="text-[var(--color-text-medium)]">
                Carregando seus vouchers...
              </p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-[var(--color-text-medium)] mb-2">
                {error}
              </p>
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[var(--color-text-medium)]">
                Nenhum voucher encontrado com os filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="grid gap-[var(--spacing-3)] sm:grid-cols-2 lg:grid-cols-3">
              {filteredVouchers.map((voucher) => (
                <Link
                  key={voucher.id}
                  href={`/account/vouchers/${voucher.id}`}
                  className={`group rounded-2xl border-2 bg-[var(--color-white)] overflow-hidden shadow-soft transition-all hover:shadow-medium ${
                    voucher.used
                      ? "border-[var(--color-border)] opacity-60 grayscale"
                      : "border-[var(--color-border)] hover:border-[var(--color-roc-primary-light)]"
                  }`}
                >
                  <div className="relative h-48 overflow-hidden bg-[var(--color-bg-light)]">
                    <img
                      src={voucher.imageUrl}
                      alt={voucher.restaurantName}
                      className={`h-full w-full object-cover transition-transform duration-300 ${
                        voucher.used ? "" : "group-hover:scale-110"
                      }`}
                    />
                    <div
                      className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold text-[var(--color-white)] shadow-medium ${
                        voucher.used
                          ? "bg-[var(--color-text-medium)]"
                          : "bg-[var(--color-roc-primary)]"
                      }`}
                    >
                      {voucher.discountLabel}
                    </div>
                  </div>

                  {/* Conteúdo do Card */}
                  <div className="p-[var(--spacing-4)]">
                  <div className="mb-[var(--spacing-3)] flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-[var(--spacing-2)]">
                        <MapPin
                          size={16}
                          weight="fill"
                          className={
                            voucher.used
                              ? "text-[var(--color-text-medium)]"
                              : "text-[var(--color-roc-primary)]"
                          }
                        />
                        <span className="text-xs font-medium uppercase text-[var(--color-text-medium)]">
                          Código: {voucher.code}
                        </span>
                      </div>
                      <h3
                        className={`mb-1 text-lg font-semibold ${
                          voucher.used
                            ? "text-[var(--color-text-medium)]"
                            : "text-[var(--color-text-dark)]"
                        }`}
                      >
                        {voucher.restaurantName}
                      </h3>
                      <p className="text-sm text-[var(--color-text-medium)]">{voucher.city}</p>
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        voucher.used
                          ? "bg-[var(--color-bg-light)] text-[var(--color-text-medium)]"
                          : "bg-[var(--color-roc-primary-light)]/10 text-[var(--color-roc-primary)]"
                      }`}
                    >
                      {voucher.used ? "Utilizado" : "Disponível"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-[var(--spacing-2)]">
                    <div className="flex items-center gap-[var(--spacing-2)]">
                      <Gift
                        size={18}
                        weight="fill"
                        className={
                          voucher.used
                            ? "text-[var(--color-text-medium)]"
                            : "text-[var(--color-roc-accent)]"
                        }
                      />
                      <span
                        className={`text-sm font-semibold ${
                          voucher.used
                            ? "text-[var(--color-text-medium)]"
                            : "text-[var(--color-text-dark)]"
                        }`}
                      >
                        {voucher.discountLabel}
                      </span>
                    </div>
                    {!voucher.used && (
                      <span className="text-xs font-medium text-[var(--color-roc-primary)] group-hover:underline">
                        Usar agora →
                      </span>
                    )}
                  </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
