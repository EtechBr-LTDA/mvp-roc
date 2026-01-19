"use client";

import Link from "next/link";
import {
  Ticket,
  ForkKnife,
  DeviceMobile,
  Star,
  SignIn,
  MapPin,
  Clock,
  Wallet,
  ShieldCheck,
  CaretDown,
  Trophy,
  Users,
  Sparkle
} from "@phosphor-icons/react";
import { RestaurantCarousel } from "./components/RestaurantCarousel";
import { useState } from "react";

// Componente FAQ Item
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[var(--color-border)] last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-[var(--color-roc-primary)]"
      >
        <span className="text-lg font-semibold text-[var(--color-text-dark)]">{question}</span>
        <CaretDown
          size={24}
          weight="bold"
          className={`text-[var(--color-roc-primary)] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-[var(--color-text-medium)] leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] font-[var(--font-family-primary)] text-[var(--color-text-dark)] antialiased">
      {/* =========== NAVBAR (CABEÇALHO) - FULL WIDTH =========== */}
      <header className="sticky top-0 z-50 w-full border-b border-[var(--color-border)] bg-[var(--color-white)]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-4 md:px-8 lg:px-12">
          <div className="text-2xl font-bold">
            <span className="text-[var(--color-roc-primary)]">ROC</span> Passaporte
          </div>
          <nav className="flex items-center gap-3 md:gap-4">
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
              href="#faq"
              className="hidden text-sm font-semibold text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)] md:block"
            >
              Dúvidas
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 rounded-lg border-2 border-[var(--color-border)] px-3 py-2 text-sm font-semibold text-[var(--color-text-dark)] transition-all hover:border-[var(--color-roc-primary)] hover:bg-[var(--color-bg-light)] hover:text-[var(--color-roc-primary)]"
            >
              <SignIn size={18} weight="bold" />
              <span className="hidden sm:inline">Entrar</span>
            </Link>
            <Link
              href="/auth/register"
              className="rounded-lg border-2 border-transparent bg-[var(--color-roc-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-white)] transition-all hover:bg-[var(--color-roc-primary-dark)] hover:-translate-y-0.5"
            >
              Assinar Agora
            </Link>
          </nav>
        </div>
      </header>

      <main className="w-full">
        {/* =========== SEÇÃO HERO (BANNER PRINCIPAL) - FULL WIDTH =========== */}
        <section className="w-full bg-[var(--color-bg-light)] py-12 md:py-20">
          <div className="mx-auto grid max-w-[1800px] grid-cols-1 items-center gap-8 px-4 md:grid-cols-2 md:px-8 lg:px-12">
            {/* Coluna de Texto */}
            <div className="flex flex-col gap-6 md:order-1">
              {/* Badge de destaque */}
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-roc-primary)]/10 px-4 py-2 text-sm font-semibold text-[var(--color-roc-primary)]">
                <Sparkle size={16} weight="fill" />
                Oferta de Lançamento
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-[var(--color-text-dark)] md:text-5xl lg:text-6xl">
                Economize mais de{" "}
                <span className="text-[var(--color-roc-primary)]">R$ 300</span>{" "}
                nos melhores restaurantes de Rondônia
              </h1>

              <p className="text-lg leading-relaxed text-[var(--color-text-medium)] md:text-xl">
                Por apenas <strong className="text-[var(--color-text-dark)]">R$ 99,99</strong>, receba{" "}
                <strong className="text-[var(--color-text-dark)]">25 vouchers exclusivos</strong> com descontos de 10% a 30%
                nos melhores restaurantes de 5 cidades. Seu passaporte se paga na primeira visita!
              </p>

              {/* Métricas de impacto */}
              <div className="flex flex-wrap gap-6 py-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-roc-primary)]/10">
                    <Trophy size={24} weight="fill" className="text-[var(--color-roc-primary)]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--color-text-dark)]">25</p>
                    <p className="text-sm text-[var(--color-text-medium)]">Restaurantes</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-roc-primary)]/10">
                    <MapPin size={24} weight="fill" className="text-[var(--color-roc-primary)]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--color-text-dark)]">5</p>
                    <p className="text-sm text-[var(--color-text-medium)]">Cidades</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-roc-primary)]/10">
                    <Clock size={24} weight="fill" className="text-[var(--color-roc-primary)]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[var(--color-text-dark)]">90</p>
                    <p className="text-sm text-[var(--color-text-medium)]">Dias de validade</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-transparent bg-[var(--color-roc-primary)] px-8 py-4 text-center text-lg font-semibold text-[var(--color-white)] shadow-lg shadow-[var(--color-roc-primary)]/30 transition-all hover:bg-[var(--color-roc-primary-dark)] hover:-translate-y-0.5"
                >
                  Assinar Agora e Economizar
                </Link>
                <Link
                  href="#restaurantes"
                  className="inline-block rounded-xl border-2 border-[var(--color-border)] px-8 py-4 text-center text-lg font-semibold text-[var(--color-roc-primary)] transition-all hover:bg-[var(--color-bg-light)] hover:border-[var(--color-roc-primary)]"
                >
                  Ver Restaurantes
                </Link>
              </div>
            </div>

            {/* Coluna de Imagem/Banner */}
            <div className="relative flex items-center justify-center md:order-2">
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&h=700&fit=crop&q=80"
                alt="Experiência gastronômica exclusiva em restaurante parceiro ROC"
                className="w-full max-w-2xl rounded-3xl shadow-2xl"
              />
              {/* Badge flutuante de economia */}
              <div className="absolute -bottom-6 -left-4 rounded-2xl bg-[var(--color-white)] p-5 shadow-xl md:-left-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                    <Wallet size={28} weight="fill" className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-text-medium)]">Economia média</p>
                    <p className="text-2xl font-bold text-green-600">R$ 300+</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========== SEÇÃO PROVA SOCIAL - PARCEIROS SELECIONADOS - FULL WIDTH =========== */}
        <section className="w-full bg-[var(--color-white)] py-12 md:py-16">
          <div className="mx-auto max-w-[1800px] px-4 md:px-8 lg:px-12">
            <p className="mb-10 text-center text-sm font-medium uppercase tracking-wider text-[var(--color-text-medium)]">
              Restaurantes parceiros que confiam no ROC Passaporte
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8">
              {[
                { name: "Cantina Italiana", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&h=100&fit=crop&q=80", category: "Italiana" },
                { name: "Churrascaria Gaúcha", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=100&h=100&fit=crop&q=80", category: "Churrasco" },
                { name: "Sushi House", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=100&h=100&fit=crop&q=80", category: "Japonesa" },
                { name: "Pizzaria Forno a Lenha", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&h=100&fit=crop&q=80", category: "Pizzaria" },
                { name: "Café Central", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=100&h=100&fit=crop&q=80", category: "Cafeteria" },
                { name: "Bistrô Francês", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100&h=100&fit=crop&q=80", category: "Francesa" },
                { name: "Restaurante Tropical", image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=100&h=100&fit=crop&q=80", category: "Brasileira" },
                { name: "Cantina Mineira", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop&q=80", category: "Mineira" },
              ].map((restaurant, index) => (
                <div
                  key={index}
                  className="group flex flex-col items-center gap-3 rounded-xl bg-[var(--color-bg-light)] p-4 transition-all hover:shadow-lg"
                >
                  <div className="h-20 w-20 overflow-hidden rounded-full border-3 border-[var(--color-border)] transition-all group-hover:border-[var(--color-roc-primary)]">
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-[var(--color-text-dark)] line-clamp-1">{restaurant.name}</p>
                    <p className="text-xs text-[var(--color-text-medium)]">{restaurant.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========== SEÇÃO BENEFÍCIOS - PROPOSTA DE VALOR - FULL WIDTH =========== */}
        <section className="w-full bg-[var(--color-roc-primary)] py-16 text-[var(--color-white)] md:py-24">
          <div className="mx-auto max-w-[1800px] px-4 md:px-8 lg:px-12">
            <div className="grid gap-12 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
                  O que você ganha com o ROC Passaporte?
                </h2>
                <p className="mb-10 text-lg leading-relaxed text-white/80 md:text-xl">
                  Mais do que descontos, oferecemos experiências gastronômicas exclusivas nos
                  melhores estabelecimentos de Rondônia. Veja o que nossos membros economizam:
                </p>

                <ul className="space-y-5">
                  {[
                    { icon: <Wallet size={24} weight="fill" />, text: "Economia garantida de R$ 300+ em média por passaporte" },
                    { icon: <Trophy size={24} weight="fill" />, text: "25 restaurantes parceiros exclusivos em 5 cidades" },
                    { icon: <Ticket size={24} weight="fill" />, text: "Descontos reais de 10% a 30% em cada visita" },
                    { icon: <DeviceMobile size={24} weight="fill" />, text: "Uso simples: QR Code ou código no celular" },
                    { icon: <ShieldCheck size={24} weight="fill" />, text: "Garantia de satisfação ou seu dinheiro de volta" },
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-center gap-5">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white/20">
                        {benefit.icon}
                      </div>
                      <span className="text-lg md:text-xl">{benefit.text}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10">
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-white)] px-8 py-4 text-lg font-semibold text-[var(--color-roc-primary)] transition-all hover:bg-white/90 hover:-translate-y-0.5"
                  >
                    Garantir meu Passaporte
                  </Link>
                </div>
              </div>

              <div className="relative">
                {/* Testemunho principal */}
                <div className="rounded-3xl border border-white/10 bg-white/10 p-8 backdrop-blur-sm md:p-10">
                  <div className="mb-5 flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={24} weight="fill" className="text-[var(--color-roc-accent)]" />
                    ))}
                  </div>
                  <blockquote className="mb-8 text-xl italic leading-relaxed md:text-2xl">
                    &quot;Economizei mais de R$ 300 em 2 meses! Os restaurantes parceiros são excelentes
                    e o processo de usar o voucher é super simples. Recomendo demais!&quot;
                  </blockquote>
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 overflow-hidden rounded-full bg-white/20">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80"
                        alt="João Silva"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <cite className="not-italic text-lg font-semibold text-white">João Silva</cite>
                      <p className="text-white/70">Membro há 3 meses • Porto Velho</p>
                    </div>
                  </div>
                </div>

                {/* Badge de membros */}
                <div className="absolute -bottom-8 -right-4 rounded-2xl bg-[var(--color-white)] p-5 shadow-xl md:-right-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-roc-primary)]/10">
                      <Users size={28} weight="fill" className="text-[var(--color-roc-primary)]" />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--color-text-medium)]">Membros ativos</p>
                      <p className="text-2xl font-bold text-[var(--color-roc-primary)]">500+</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========== SEÇÃO COMO FUNCIONA - FULL WIDTH =========== */}
        <section id="como-funciona" className="w-full bg-[var(--color-bg-light)] py-16 md:py-24">
          <div className="mx-auto max-w-[1800px] px-4 md:px-8 lg:px-12">
            <div className="mb-16 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-roc-primary)]">
                Simples e Rápido
              </p>
              <h2 className="mb-5 text-3xl font-bold text-[var(--color-text-dark)] md:text-4xl lg:text-5xl">
                Seu roteiro gastronômico em 3 passos
              </h2>
              <p className="mx-auto max-w-3xl text-lg text-[var(--color-text-medium)] md:text-xl">
                Comece a economizar em minutos. Sem burocracia, sem complicação.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
              {[
                {
                  icon: <Ticket size={40} weight="fill" />,
                  step: "01",
                  title: "Assine o Passaporte",
                  description:
                    "Faça seu cadastro em menos de 2 minutos e tenha acesso imediato a todos os 25 vouchers exclusivos.",
                },
                {
                  icon: <ForkKnife size={40} weight="fill" />,
                  step: "02",
                  title: "Escolha o Restaurante",
                  description:
                    "Navegue pelos parceiros em Porto Velho, Ji-Paraná, Ariquemes, Vilhena ou Cacoal e escolha onde quer comer.",
                },
                {
                  icon: <DeviceMobile size={40} weight="fill" />,
                  step: "03",
                  title: "Apresente e Economize",
                  description:
                    "Mostre o QR Code ou código ao garçom antes de pedir. O desconto é aplicado direto na conta!",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="group relative rounded-3xl border border-[var(--color-border)] bg-[var(--color-white)] p-10 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-[var(--color-roc-primary)]"
                >
                  <div className="absolute -top-6 left-10 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-roc-primary)] text-lg font-bold text-[var(--color-white)] shadow-lg">
                    {item.step}
                  </div>
                  <div className="mb-6 mt-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--color-roc-primary)]/10 text-[var(--color-roc-primary)] transition-transform group-hover:scale-110">
                    {item.icon}
                  </div>
                  <h3 className="mb-4 text-2xl font-bold text-[var(--color-text-dark)]">
                    {item.title}
                  </h3>
                  <p className="text-lg text-[var(--color-text-medium)] leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========== SEÇÃO RESTAURANTES PARCEIROS (CARROSSEL) - FULL WIDTH =========== */}
        <section id="restaurantes" className="w-full bg-[var(--color-white)] py-16 md:py-24">
          <div className="mx-auto max-w-[1800px] px-4 md:px-8 lg:px-12">
            <div className="mb-12 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-roc-primary)]">
                Nossos Parceiros
              </p>
              <h2 className="mb-5 text-3xl font-bold text-[var(--color-text-dark)] md:text-4xl lg:text-5xl">
                Conheça os 25 restaurantes exclusivos
              </h2>
              <p className="mx-auto max-w-3xl text-lg text-[var(--color-text-medium)] md:text-xl">
                De churrascarias a bistrôs sofisticados, temos opções para todos os gostos em 5 cidades de Rondônia.
              </p>
            </div>

            {/* Carrossel de Restaurantes */}
            <RestaurantCarousel />

            {/* CTA após o carrossel */}
            <div className="mt-12 text-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-roc-primary)] px-10 py-5 text-lg font-semibold text-[var(--color-white)] shadow-lg shadow-[var(--color-roc-primary)]/30 transition-all hover:bg-[var(--color-roc-primary-dark)] hover:-translate-y-0.5"
              >
                Quero acesso a todos os restaurantes
              </Link>
            </div>
          </div>
        </section>

        {/* =========== SEÇÃO FAQ - FULL WIDTH =========== */}
        <section id="faq" className="w-full bg-[var(--color-bg-light)] py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 md:px-8">
            <div className="mb-12 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-roc-primary)]">
                Dúvidas Frequentes
              </p>
              <h2 className="mb-5 text-3xl font-bold text-[var(--color-text-dark)] md:text-4xl lg:text-5xl">
                Tire suas dúvidas
              </h2>
              <p className="text-lg text-[var(--color-text-medium)] md:text-xl">
                Tudo o que você precisa saber antes de assinar
              </p>
            </div>

            <div className="rounded-3xl bg-[var(--color-white)] p-8 shadow-lg md:p-10">
              <FAQItem
                question="Por que a validade é de 90 dias?"
                answer="O prazo de 90 dias foi pensado para você aproveitar todos os 25 vouchers com calma, visitando em média 2 restaurantes por semana. Isso garante que você use todos os benefícios e economize o máximo possível. Além disso, nosso plano de lançamento oferece o melhor custo-benefício do mercado!"
              />
              <FAQItem
                question="Como uso meu voucher no restaurante?"
                answer="É super simples! Antes de fazer seu pedido, informe ao garçom que você é membro ROC Passaporte e apresente o QR Code ou código no seu celular. O desconto será aplicado automaticamente na sua conta. Não precisa imprimir nada!"
              />
              <FAQItem
                question="Posso usar mais de um voucher por visita?"
                answer="Cada voucher é válido para uma visita em um restaurante específico. Você pode usar vouchers diferentes em visitas diferentes, ou até no mesmo dia em restaurantes diferentes. Cada parceiro oferece um voucher exclusivo."
              />
              <FAQItem
                question="Como é calculada a economia de R$ 300?"
                answer="A economia média é baseada no uso real dos nossos membros. Com 25 vouchers oferecendo descontos de 10% a 30%, considerando um gasto médio de R$ 80-150 por visita, nossos membros economizam entre R$ 200 e R$ 500, com média de R$ 300 em 2 meses de uso."
              />
              <FAQItem
                question="Posso cancelar e ter meu dinheiro de volta?"
                answer="Sim! Se você não ficar satisfeito nos primeiros 7 dias após a compra e não tiver utilizado nenhum voucher, devolvemos 100% do valor pago. Sua satisfação é nossa prioridade."
              />
              <FAQItem
                question="O desconto vale para toda a mesa?"
                answer="Sim! O desconto do voucher é aplicado na conta total da mesa, não importa quantas pessoas estejam. É perfeito para jantares em família ou com amigos!"
              />
            </div>
          </div>
        </section>

        {/* =========== SEÇÃO CTA FINAL - FULL WIDTH =========== */}
        <section className="w-full bg-gradient-to-br from-[var(--color-roc-primary)] to-[var(--color-roc-primary-dark)] py-20 text-center text-[var(--color-white)] md:py-28">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
              Pronto para economizar nos melhores restaurantes?
            </h2>
            <p className="mb-10 text-lg text-white/80 md:text-xl">
              Junte-se a mais de 500 membros que já economizam com o ROC Passaporte.
              Por apenas R$ 99,99, você terá acesso a 25 restaurantes exclusivos.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-white)] px-10 py-5 text-lg font-semibold text-[var(--color-roc-primary)] shadow-lg transition-all hover:bg-white/90 hover:-translate-y-0.5"
              >
                Assinar Agora por R$ 99,99
              </Link>
            </div>
            <p className="mt-8 text-sm text-white/60">
              Garantia de 7 dias ou seu dinheiro de volta
            </p>
          </div>
        </section>
      </main>

      {/* =========== RODAPÉ PROFISSIONAL - FULL WIDTH =========== */}
      <footer className="w-full border-t border-[var(--color-border)] bg-[var(--color-white)]">
        {/* Seção Principal do Footer */}
        <div className="mx-auto max-w-[1800px] px-4 py-16 md:px-8 lg:px-12">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {/* Coluna 1: Marca e Descrição */}
            <div className="lg:col-span-1">
              <div className="mb-5 text-2xl font-bold">
                <span className="text-[var(--color-roc-primary)]">ROC</span> Passaporte
              </div>
              <p className="mb-8 text-sm leading-relaxed text-[var(--color-text-medium)]">
                O seu guia de experiências gastronômicas em Rondônia. Economize nos melhores restaurantes com descontos exclusivos.
              </p>
              {/* Redes Sociais */}
              <div className="flex gap-3">
                <a
                  href="https://instagram.com/rocpassaporte"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-light)] text-[var(--color-text-medium)] transition-all hover:bg-[var(--color-roc-primary)] hover:text-white"
                  aria-label="Instagram"
                >
                  <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a
                  href="https://facebook.com/rocpassaporte"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-light)] text-[var(--color-text-medium)] transition-all hover:bg-[var(--color-roc-primary)] hover:text-white"
                  aria-label="Facebook"
                >
                  <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://wa.me/5569999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-bg-light)] text-[var(--color-text-medium)] transition-all hover:bg-green-500 hover:text-white"
                  aria-label="WhatsApp"
                >
                  <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Coluna 2: Navegação */}
            <div>
              <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-[var(--color-text-dark)]">
                Navegação
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link href="#como-funciona" className="text-sm text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)]">
                    Como Funciona
                  </Link>
                </li>
                <li>
                  <Link href="#restaurantes" className="text-sm text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)]">
                    Restaurantes Parceiros
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="text-sm text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)]">
                    Dúvidas Frequentes
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="text-sm text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)]">
                    Assinar Agora
                  </Link>
                </li>
                <li>
                  <Link href="/auth/login" className="text-sm text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)]">
                    Área do Membro
                  </Link>
                </li>
              </ul>
            </div>

            {/* Coluna 3: Legal e Apoio */}
            <div>
              <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-[var(--color-text-dark)]">
                Legal
              </h4>
              <ul className="space-y-4">
                <li>
                  <Link href="/termos" className="text-sm text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)]">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link href="/privacidade" className="text-sm text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)]">
                    Política de Privacidade
                  </Link>
                </li>
                <li>
                  <Link href="/reembolso" className="text-sm text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)]">
                    Política de Reembolso
                  </Link>
                </li>
                <li>
                  <a href="mailto:contato@rocpassaporte.com.br" className="text-sm text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)]">
                    Contato
                  </a>
                </li>
              </ul>
            </div>

            {/* Coluna 4: Formas de Pagamento e Segurança */}
            <div>
              <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-[var(--color-text-dark)]">
                Pagamento Seguro
              </h4>
              <div className="mb-5 flex flex-wrap gap-2">
                {/* Ícones de Pagamento */}
                <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-[var(--color-bg-light)] px-2">
                  <span className="text-xs font-bold text-[var(--color-text-medium)]">VISA</span>
                </div>
                <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-[var(--color-bg-light)] px-2">
                  <span className="text-xs font-bold text-[var(--color-text-medium)]">MC</span>
                </div>
                <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-[var(--color-bg-light)] px-2">
                  <span className="text-xs font-bold text-[var(--color-text-medium)]">ELO</span>
                </div>
                <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-[var(--color-bg-light)] px-2">
                  <span className="text-xs font-bold text-green-600">PIX</span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4">
                <ShieldCheck size={28} weight="fill" className="text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-700">Compra 100% Segura</p>
                  <p className="text-xs text-green-600">Ambiente protegido com SSL</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Linha Inferior - Copyright e Informações Legais */}
        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-light)]">
          <div className="mx-auto flex max-w-[1800px] flex-col items-center justify-between gap-4 px-4 py-6 text-center md:flex-row md:px-8 md:text-left lg:px-12">
            <p className="text-sm text-[var(--color-text-medium)]">
              &copy; 2026 ROC Passaporte. Todos os direitos reservados.
            </p>
            <p className="text-sm text-[var(--color-text-medium)]">
              ROC Passaporte é um produto de <strong>ROC Rondônia Oferta Club LTDA</strong> • CNPJ: 00.000.000/0001-00
            </p>
            <p className="text-sm text-[var(--color-text-medium)]">
              Porto Velho, Rondônia - Brasil
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
