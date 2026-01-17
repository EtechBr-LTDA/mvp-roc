"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-white)]">
      <div className="mx-auto max-w-7xl px-[var(--spacing-4)] py-[var(--spacing-3)]">
        <div className="flex flex-col items-center justify-between gap-[var(--spacing-3)] text-sm text-[var(--color-text-medium)] md:flex-row">
          <div className="flex items-center gap-[var(--spacing-2)]">
            <span className="text-xl font-bold">
              <span className="text-[var(--color-roc-primary)]">ROC</span> Passaporte
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-[var(--spacing-3)]">
            <Link href="/" className="hover:text-[var(--color-roc-primary)]">
              Início
            </Link>
            <Link href="/benefits" className="hover:text-[var(--color-roc-primary)]">
              Benefícios
            </Link>
            <Link href="/account/vouchers" className="hover:text-[var(--color-roc-primary)]">
              Meus Vouchers
            </Link>
          </div>

          <p className="text-xs text-[var(--color-text-medium)]">
            © 2024 Rondônia Oferta Club. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}



