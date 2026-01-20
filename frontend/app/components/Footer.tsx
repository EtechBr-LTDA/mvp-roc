"use client";

import Link from "next/link";
import {
  InstagramLogo,
  FacebookLogo,
  WhatsappLogo,
  EnvelopeSimple,
  MapPin,
  Phone,
  ShieldCheck,
  CreditCard,
} from "@phosphor-icons/react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-white">
      {/* Seção Principal */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Coluna 1 - Sobre */}
          <div className="lg:col-span-1">
            <Link href="/" className="mb-4 inline-block">
              <span className="text-2xl font-bold">
                <span className="text-[var(--color-roc-primary)]">ROC</span>{" "}
                <span className="text-[var(--color-text-dark)]">Passaporte</span>
              </span>
            </Link>
            <p className="mb-6 text-sm leading-relaxed text-[var(--color-text-medium)]">
              O maior clube de benefícios gastronômicos de Rondônia. Descontos
              exclusivos nos melhores restaurantes da região.
            </p>
            {/* Redes Sociais */}
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/rocpassaporte"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-light)] text-[var(--color-text-medium)] transition-all hover:bg-[var(--color-roc-primary)] hover:text-white"
                aria-label="Instagram"
              >
                <InstagramLogo size={20} weight="fill" />
              </a>
              <a
                href="https://facebook.com/rocpassaporte"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-light)] text-[var(--color-text-medium)] transition-all hover:bg-[var(--color-roc-primary)] hover:text-white"
                aria-label="Facebook"
              >
                <FacebookLogo size={20} weight="fill" />
              </a>
              <a
                href="https://wa.me/5569999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-light)] text-[var(--color-text-medium)] transition-all hover:bg-[#25D366] hover:text-white"
                aria-label="WhatsApp"
              >
                <WhatsappLogo size={20} weight="fill" />
              </a>
            </div>
          </div>

          {/* Coluna 2 - Links Rápidos */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-dark)]">
              Links Rápidos
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)]"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  href="/account/vouchers"
                  className="text-sm text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)]"
                >
                  Meus Vouchers
                </Link>
              </li>
              <li>
                <Link
                  href="/account/vouchers"
                  className="text-sm text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)]"
                >
                  Restaurantes Parceiros
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className="text-sm text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)]"
                >
                  Assine Agora
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3 - Suporte */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-dark)]">
              Suporte
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/account/support"
                  className="text-sm text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)]"
                >
                  Perguntas Frequentes
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)]"
                >
                  Termos de Uso
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)]"
                >
                  Política de Privacidade
                </a>
              </li>
              <li>
                <Link
                  href="/account/support"
                  className="text-sm text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)]"
                >
                  Fale Conosco
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4 - Contato */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--color-text-dark)]">
              Contato
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin
                  size={18}
                  weight="fill"
                  className="mt-0.5 flex-shrink-0 text-[var(--color-roc-primary)]"
                />
                <span className="text-sm text-[var(--color-text-medium)]">
                  Porto Velho, Rondônia
                  <br />
                  Brasil
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone
                  size={18}
                  weight="fill"
                  className="flex-shrink-0 text-[var(--color-roc-primary)]"
                />
                <a
                  href="tel:+5569999999999"
                  className="text-sm text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)]"
                >
                  (69) 99999-9999
                </a>
              </li>
              <li className="flex items-center gap-3">
                <EnvelopeSimple
                  size={18}
                  weight="fill"
                  className="flex-shrink-0 text-[var(--color-roc-primary)]"
                />
                <a
                  href="mailto:contato@rocpassaporte.com.br"
                  className="text-sm text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-roc-primary)]"
                >
                  contato@rocpassaporte.com.br
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Badges de Confiança */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 border-t border-[var(--color-border)] pt-8">
          <div className="flex items-center gap-2 text-[var(--color-text-medium)]">
            <ShieldCheck size={20} weight="fill" className="text-green-500" />
            <span className="text-xs">Site Seguro</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--color-text-medium)]">
            <CreditCard
              size={20}
              weight="fill"
              className="text-[var(--color-roc-primary)]"
            />
            <span className="text-xs">Pagamento Seguro</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--color-text-medium)]">
            <span className="text-xl font-bold text-[var(--color-roc-primary)]">25+</span>
            <span className="text-xs">Restaurantes Parceiros</span>
          </div>
          <div className="flex items-center gap-2 text-[var(--color-text-medium)]">
            <span className="text-xl font-bold text-[var(--color-roc-primary)]">5</span>
            <span className="text-xs">Cidades Atendidas</span>
          </div>
        </div>
      </div>

      {/* Barra Inferior */}
      <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-light)]">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs text-[var(--color-text-medium)]">
              © {currentYear} ROC Passaporte - Rondônia Oferta Club. Todos os
              direitos reservados.
            </p>
            <a
              href="https://etechbr.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-[var(--color-text-medium)] hover:text-[var(--color-roc-primary)] transition-colors"
            >
              Feito por
              <img
                src="https://ngyphawxicyvxotozkra.supabase.co/storage/v1/object/public/Ebr/Etech%20preta.svg"
                alt="EtechBr"
                className="h-3"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}





