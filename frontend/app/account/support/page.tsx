"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Headset,
  Question,
  ChatCircleDots,
  WhatsappLogo,
  Envelope,
  Phone,
  CaretRight,
  MagnifyingGlass,
  ArrowLeft,
  Ticket,
  CreditCard,
  User,
  MapPin,
  ShieldCheck,
  Clock,
  CheckCircle,
} from "@phosphor-icons/react";
import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { apiClient } from "@/app/lib/api";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    category: "Vouchers",
    question: "Como usar meu voucher no restaurante?",
    answer: "Ao chegar no restaurante parceiro, informe que possui o ROC Passaporte. Mostre o QR Code do voucher no seu celular ou o código para o atendente validar. O desconto será aplicado automaticamente na sua conta.",
  },
  {
    category: "Vouchers",
    question: "Posso usar mais de um voucher na mesma visita?",
    answer: "Não, cada voucher é de uso único e válido apenas uma vez por restaurante. Você pode usar diferentes vouchers em restaurantes diferentes no mesmo dia.",
  },
  {
    category: "Vouchers",
    question: "O que acontece se meu voucher expirar?",
    answer: "Os vouchers expirados não podem ser utilizados. Recomendamos usar seus vouchers antes da data de validade indicada em cada um.",
  },
  {
    category: "Conta",
    question: "Como atualizar meus dados cadastrais?",
    answer: "Acesse a página 'Meu Perfil' através do menu no canto superior direito. Lá você pode editar seu nome, telefone e endereço de entrega.",
  },
  {
    category: "Conta",
    question: "Esqueci minha senha, o que fazer?",
    answer: "Na tela de login, clique em 'Esqueceu a senha?' e siga as instruções para redefinir sua senha através do e-mail cadastrado.",
  },
  {
    category: "Pagamento",
    question: "Quais formas de pagamento são aceitas?",
    answer: "Aceitamos cartões de crédito (Visa, Mastercard, Elo), cartões de débito e PIX para a compra do passaporte.",
  },
  {
    category: "Entrega",
    question: "Quanto tempo leva para receber meu passaporte físico?",
    answer: "O passaporte físico é enviado em até 5 dias úteis após a confirmação do pagamento. O prazo de entrega varia de acordo com sua localização.",
  },
];

export default function SupportPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    if (!apiClient.isAuthenticated()) {
      router.push("/auth/login");
      return;
    }
    setIsLoading(false);
  }, [router]);

  const categories = [
    { id: "vouchers", label: "Vouchers", icon: Ticket },
    { id: "conta", label: "Minha Conta", icon: User },
    { id: "pagamento", label: "Pagamento", icon: CreditCard },
    { id: "entrega", label: "Entrega", icon: MapPin },
  ];

  const filteredFaqs = faqItems.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === null ||
      item.category.toLowerCase() === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-light)]">
        <Header />
        <main className="pt-24 pb-12">
          <div className="mx-auto max-w-4xl px-4">
            <div className="flex items-center justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-roc-primary)] border-t-transparent" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)]">
      <Header />

      <main className="pt-24 pb-12">
        <div className="mx-auto max-w-4xl px-4">
          {/* Header da página */}
          <div className="mb-6">
            <button
              onClick={() => router.push("/account/vouchers")}
              className="mb-4 flex items-center gap-2 text-sm text-[var(--color-text-medium)] hover:text-[var(--color-roc-primary)] transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar para vouchers
            </button>
            <h1 className="text-2xl font-bold text-[var(--color-text-dark)]">
              Central de Suporte
            </h1>
            <p className="text-sm text-[var(--color-text-medium)]">
              Encontre respostas ou entre em contato conosco
            </p>
          </div>

          {/* Card de contato rápido */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-gradient-to-br from-[var(--color-roc-primary)] to-[var(--color-roc-primary-dark)] p-6 text-white mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <Headset size={24} weight="fill" />
              </div>
              <div>
                <h2 className="font-semibold">Precisa de ajuda?</h2>
                <p className="text-sm text-white/80">
                  Nossa equipe está pronta para te atender
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <a
                href="https://wa.me/5569999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm p-4 hover:bg-white/20 transition-colors"
              >
                <WhatsappLogo size={24} weight="fill" />
                <div>
                  <p className="text-sm font-medium">WhatsApp</p>
                  <p className="text-xs text-white/70">Resposta rápida</p>
                </div>
              </a>

              <a
                href="mailto:suporte@rocpassaporte.com.br"
                className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm p-4 hover:bg-white/20 transition-colors"
              >
                <Envelope size={24} weight="fill" />
                <div>
                  <p className="text-sm font-medium">E-mail</p>
                  <p className="text-xs text-white/70">suporte@roc...</p>
                </div>
              </a>

              <a
                href="tel:+556932234567"
                className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm p-4 hover:bg-white/20 transition-colors"
              >
                <Phone size={24} weight="fill" />
                <div>
                  <p className="text-sm font-medium">Telefone</p>
                  <p className="text-xs text-white/70">(69) 3223-4567</p>
                </div>
              </a>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-white/80">
              <Clock size={16} />
              <span>Atendimento: Seg-Sex, 8h às 18h</span>
            </div>
          </motion.div>

          {/* Busca */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="relative">
              <MagnifyingGlass
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-medium)]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar nas perguntas frequentes..."
                className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 pl-12 text-sm outline-none focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20"
              />
            </div>
          </motion.div>

          {/* Categorias */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6 flex flex-wrap gap-2"
          >
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === null
                  ? "bg-[var(--color-roc-primary)] text-white"
                  : "bg-white border border-[var(--color-border)] text-[var(--color-text-dark)] hover:border-[var(--color-roc-primary)]"
              }`}
            >
              Todas
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-[var(--color-roc-primary)] text-white"
                    : "bg-white border border-[var(--color-border)] text-[var(--color-text-dark)] hover:border-[var(--color-roc-primary)]"
                }`}
              >
                <category.icon size={16} />
                {category.label}
              </button>
            ))}
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-white p-6 shadow-soft"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-roc-primary)]/10">
                <Question size={24} weight="fill" className="text-[var(--color-roc-primary)]" />
              </div>
              <div>
                <h2 className="font-semibold text-[var(--color-text-dark)]">
                  Perguntas Frequentes
                </h2>
                <p className="text-xs text-[var(--color-text-medium)]">
                  Respostas para as dúvidas mais comuns
                </p>
              </div>
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="rounded-xl bg-[var(--color-bg-light)] p-8 text-center">
                <Question size={40} className="mx-auto mb-3 text-[var(--color-text-medium)]" />
                <p className="text-[var(--color-text-dark)] font-medium">
                  Nenhum resultado encontrado
                </p>
                <p className="text-sm text-[var(--color-text-medium)]">
                  Tente buscar com outras palavras ou entre em contato conosco
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFaqs.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-[var(--color-border)] overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="flex w-full items-center justify-between p-4 text-left hover:bg-[var(--color-bg-light)] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-bg-light)]">
                          <ChatCircleDots size={16} className="text-[var(--color-roc-primary)]" />
                        </div>
                        <span className="font-medium text-[var(--color-text-dark)]">
                          {item.question}
                        </span>
                      </div>
                      <CaretRight
                        size={20}
                        className={`text-[var(--color-text-medium)] transition-transform ${
                          expandedFaq === index ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                    {expandedFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-[var(--color-border)] bg-[var(--color-bg-light)] px-4 py-3"
                      >
                        <p className="text-sm text-[var(--color-text-medium)] leading-relaxed pl-11">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Card de não encontrou */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6 rounded-2xl bg-white p-6 shadow-soft text-center"
          >
            <CheckCircle size={40} className="mx-auto mb-3 text-[var(--color-roc-success)]" />
            <h3 className="font-semibold text-[var(--color-text-dark)] mb-1">
              Não encontrou o que procurava?
            </h3>
            <p className="text-sm text-[var(--color-text-medium)] mb-4">
              Nossa equipe está pronta para ajudar você com qualquer dúvida
            </p>
            <a
              href="https://wa.me/5569999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-roc-success)] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--color-roc-success)]/90"
            >
              <WhatsappLogo size={20} weight="fill" />
              Falar no WhatsApp
            </a>
          </motion.div>

          {/* Info de segurança */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[var(--color-text-medium)]">
            <ShieldCheck size={16} weight="fill" className="text-[var(--color-roc-success)]" />
            <span>Atendimento seguro e confidencial</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
