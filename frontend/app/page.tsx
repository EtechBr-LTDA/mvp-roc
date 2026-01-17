"use client";

import Link from "next/link";
import { Ticket, ForkKnife, DeviceMobile, CheckCircle, Star, SignIn } from "@phosphor-icons/react";
import { RestaurantCarousel } from "./components/RestaurantCarousel";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] font-[var(--font-family-primary)] text-[var(--color-text-dark)] antialiased">
      {/* Container Principal */}
      <div className="mx-auto max-w-[1400px] px-[var(--spacing-4)] md:px-[var(--spacing-6)] lg:px-[var(--spacing-7)]">
        {/* =========== NAVBAR (CABEÇALHO) =========== */}
        <header className="flex items-center justify-between py-[var(--spacing-4)]">
          <div className="text-2xl font-bold">
            <span className="text-[var(--color-roc-primary)]">ROC</span> Passaporte
          </div>
          <nav className="flex items-center gap-[var(--spacing-3)] md:gap-[var(--spacing-4)]">
            <Link
              href="#como-funciona"
              className="hidden text-sm font-semibold text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)] sm:block"
            >
              Como Funciona
            </Link>
            <Link
              href="#restaurantes"
              className="hidden text-sm font-semibold text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)] sm:block"
            >
              Restaurantes
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-[var(--spacing-2)] rounded-lg border-2 border-[var(--color-border)] px-[var(--spacing-3)] py-[var(--spacing-2)] text-sm font-semibold text-[var(--color-text-dark)] transition-all hover:border-[var(--color-roc-primary)] hover:bg-[var(--color-bg-light)] hover:text-[var(--color-roc-primary)]"
            >
              <SignIn size={18} weight="bold" />
              <span className="hidden sm:inline">Entrar</span>
            </Link>
            <Link
              href="/auth/register"
              className="rounded-lg border-2 border-transparent bg-[var(--color-roc-primary)] px-[var(--spacing-4)] py-[var(--spacing-2)] text-sm font-semibold text-[var(--color-white)] transition-all hover:bg-[var(--color-roc-primary-dark)] hover:-translate-y-0.5"
            >
              Comprar Passaporte
            </Link>
          </nav>
        </header>

        <main>
          {/* =========== SEÇÃO HERO (BANNER PRINCIPAL) =========== */}
          <section className="grid grid-cols-1 items-center gap-[var(--spacing-6)] py-[var(--spacing-6)] md:grid-cols-2 md:py-[var(--spacing-7)]">
            {/* Coluna de Texto */}
            <div className="flex flex-col gap-[var(--spacing-4)] md:order-1">
              <h1 className="text-[3rem] font-bold leading-tight tracking-tight text-[var(--color-text-dark)] md:text-[3.5rem]">
                O passaporte para o melhor da gastronomia de Rondônia.
              </h1>
              <p className="text-lg leading-relaxed text-[var(--color-text-medium)] md:text-xl">
                Compre seu passaporte por R$ 99,99 e ganhe 25 vouchers exclusivos para usar nos melhores restaurantes de 5 cidades. Válido por 90 dias.
              </p>
              <div className="flex flex-col gap-[var(--spacing-3)] sm:flex-row">
                <Link
                  href="/auth/register"
                  className="inline-block rounded-lg border-2 border-transparent bg-[var(--color-roc-primary)] px-[var(--spacing-5)] py-[var(--spacing-3)] text-center text-lg font-semibold text-[var(--color-white)] transition-all hover:bg-[var(--color-roc-primary-dark)] hover:-translate-y-0.5"
                >
                  Garantir meu Passaporte
                </Link>
                <Link
                  href="#restaurantes"
                  className="inline-block rounded-lg border-2 border-[var(--color-border)] px-[var(--spacing-5)] py-[var(--spacing-3)] text-center text-lg font-semibold text-[var(--color-roc-primary)] transition-all hover:bg-[var(--color-bg-light)] hover:border-[var(--color-roc-primary)]"
                >
                  Ver Restaurantes
                </Link>
              </div>
            </div>

            {/* Coluna de Imagem/Banner */}
            <div className="flex items-center justify-center md:order-2">
              <img
                src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=800&fit=crop&q=80"
                alt="Banner de um prato de restaurante parceiro do ROC"
                className="max-w-full rounded-2xl shadow-medium"
              />
            </div>
          </section>

          {/* =========== SEÇÃO COMO FUNCIONA =========== */}
          <section id="como-funciona" className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl">
              <div className="mb-12 text-center md:mb-16">
                <h2 className="mb-4 text-4xl font-bold text-[var(--color-text-dark)] md:text-5xl">
                  Como Funciona
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-[var(--color-text-medium)]">
                  Em 3 passos simples você começa a economizar
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {[
                  {
                    icon: <Ticket size={32} weight="fill" />,
                    step: "01",
                    title: "Assine o Passaporte",
                    description:
                      "Escolha seu plano e tenha acesso imediato a todos os vouchers exclusivos dos restaurantes parceiros.",
                  },
                  {
                    icon: <ForkKnife size={32} weight="fill" />,
                    step: "02",
                    title: "Escolha o Restaurante",
                    description:
                      "Navegue pelas ofertas disponíveis e escolha onde você quer comer hoje. 25 parceiros em 5 cidades!",
                  },
                  {
                    icon: <DeviceMobile size={32} weight="fill" />,
                    step: "03",
                    title: "Apresente o Cupom",
                    description:
                      "Gere seu cupom exclusivo e apresente ao garçom. O desconto é aplicado direto na conta!",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="group relative rounded-2xl border border-[var(--color-border)] bg-[var(--color-white)] p-8 shadow-soft transition-all duration-300 hover:shadow-medium"
                  >
                    <div className="absolute -top-4 left-8 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-roc-primary)] text-sm font-bold text-[var(--color-white)]">
                      {item.step}
                    </div>
                    <div className="mb-4 text-[var(--color-roc-primary)] transition-transform group-hover:scale-110">
                      {item.icon}
                    </div>
                    <h3 className="mb-3 text-xl font-semibold text-[var(--color-text-dark)]">
                      {item.title}
                    </h3>
                    <p className="text-[var(--color-text-medium)]">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* =========== SEÇÃO RESTAURANTES PARCEIROS SELECIONADOS =========== */}
          <section className="bg-[var(--color-bg-light)] py-12">
            <div className="mx-auto max-w-5xl px-[var(--spacing-4)]">
              <p className="mb-6 text-center text-sm text-[var(--color-text-medium)]">
                Restaurantes parceiros selecionados
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
                {[
                  { id: 1, name: "Cantina Bella Italia", logo: "🍝" },
                  { id: 2, name: "Churrascaria Gaúcha", logo: "🥩" },
                  { id: 3, name: "Sushi House", logo: "🍣" },
                  { id: 4, name: "Pizzaria Forno a Lenha", logo: "🍕" },
                  { id: 5, name: "Café Central", logo: "☕" },
                  { id: 6, name: "Bistrô Moderno", logo: "🍽️" },
                  { id: 7, name: "Restaurante Tropical", logo: "🌴" },
                  { id: 8, name: "Cantina Mineira", logo: "🍖" },
                ].map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="flex items-center gap-2 text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-text-dark)]"
                  >
                    <span className="text-3xl">{restaurant.logo}</span>
                    <span className="font-medium">{restaurant.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* =========== SEÇÃO BENEFÍCIOS =========== */}
          <section className="w-full bg-[var(--color-roc-primary)] py-12 text-[var(--color-white)] md:py-20">
            <div className="mx-auto w-full px-[var(--spacing-4)] md:px-[var(--spacing-6)] lg:px-[var(--spacing-7)] xl:px-[var(--spacing-7)]">
              <div className="grid gap-12 md:grid-cols-2 md:items-center">
                <div>
                  <h2 className="mb-6 text-4xl font-bold md:text-5xl">
                    Por que ser membro do ROC Passaporte?
                  </h2>
                  <p className="mb-8 text-lg leading-relaxed text-white/80">
                    Mais do que descontos, oferecemos experiências gastronômicas exclusivas nos
                    melhores estabelecimentos de Rondônia.
                  </p>

                  <ul className="space-y-4">
                    {[
                      "Descontos reais de 10% a 30% em cada visita",
                      "25 restaurantes parceiros exclusivos",
                      "Vouchers válidos por 90 dias",
                      "Uso simples por QR Code ou código",
                      "Acesso digital e físico ao mesmo tempo",
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                          <CheckCircle size={16} weight="fill" className="text-[var(--color-white)]" />
                        </div>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative">
                  <div className="rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-sm">
                    <div className="mb-4 flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={20} weight="fill" className="text-[var(--color-roc-accent)]" />
                      ))}
                    </div>
                    <blockquote className="mb-4 text-lg italic">
                      &quot;Economizei mais de R$ 300 em 2 meses! Os restaurantes parceiros são excelentes
                      e o processo de usar o voucher é super simples.&quot;
                    </blockquote>
                    <cite className="not-italic text-white/70">
                      — João Silva, membro há 3 meses
                    </cite>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =========== SEÇÃO RESTAURANTES PARCEIROS =========== */}
          <section id="restaurantes" className="rounded-2xl bg-[var(--color-white)] py-[var(--spacing-7)]">
            <div className="px-[var(--spacing-4)] md:px-[var(--spacing-5)] lg:px-[var(--spacing-6)]">
              <h2 className="mb-[var(--spacing-3)] text-center text-[2.25rem] font-bold text-[var(--color-text-dark)]">
                Conheça nossos 25 parceiros exclusivos
              </h2>
              <p className="mx-auto mb-[var(--spacing-5)] max-w-[600px] text-center text-lg text-[var(--color-text-medium)]">
                De hamburguerias a restaurantes sofisticados em 5 cidades de Rondônia.
              </p>

              {/* Carrossel de Restaurantes */}
              <RestaurantCarousel />
            </div>
          </section>
        </main>

        {/* =========== RODAPÉ =========== */}
        <footer className="mt-[var(--spacing-6)] border-t border-[var(--color-border)] py-[var(--spacing-5)] text-center">
          <p className="text-sm text-[var(--color-text-medium)]">
            &copy; 2026 ROC - Passaporte Rondônia Oferta Club. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
}
