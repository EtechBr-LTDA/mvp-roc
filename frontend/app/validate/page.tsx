"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Keyboard,
  QrCode,
  ArrowClockwise,
  ArrowLeft,
  Storefront,
  Tag,
  Clock,
  Sparkle,
  ForkKnife,
} from "@phosphor-icons/react";
import { QRScanner } from "../components/QRScanner";

type ValidationMode = "choice" | "manual" | "scanner";
type ValidationStatus = "idle" | "validating" | "success" | "error";

export default function ValidatePage() {
  const [mode, setMode] = useState<ValidationMode>("choice");
  const [inputCode, setInputCode] = useState("");
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>("idle");
  const [couponInfo, setCouponInfo] = useState<{ restaurant: string; offer: string } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = async (code: string) => {
    if (!code.trim() || isValidating) {
      return;
    }

    setIsValidating(true);
    setValidationStatus("validating");

    try {
      const response = await fetch("/api/vouchers/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        setValidationStatus("error");
        setCouponInfo(null);
        setIsValidating(false);
        return;
      }

      if (data.voucher && data.voucher.restaurant) {
        setCouponInfo({
          restaurant: data.voucher.restaurant.name,
          offer: data.voucher.restaurant.offer,
        });
      } else {
        setCouponInfo(null);
      }

      setValidationStatus("success");
    } catch (error) {
      console.error("Erro ao validar cupom:", error);
      setValidationStatus("error");
      setCouponInfo(null);
    } finally {
      setIsValidating(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleValidate(inputCode);
  };

  const handleQRScan = (code: string) => {
    handleValidate(code);
  };

  const handleReset = () => {
    setInputCode("");
    setValidationStatus("idle");
    setCouponInfo(null);
    setMode("choice");
  };

  // Se estiver no modo scanner, renderizar componente QRScanner
  if (mode === "scanner" && validationStatus === "idle") {
    return (
      <QRScanner
        onScan={handleQRScan}
        onClose={() => {
          setMode("choice");
        }}
      />
    );
  }

    return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[var(--color-roc-primary)] via-[var(--color-roc-primary)] to-[var(--color-roc-primary-dark)]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[var(--color-roc-primary-dark)]/80 py-3 backdrop-blur-md sm:py-4">
        <div className="mx-auto w-full max-w-[1400px] px-[var(--spacing-4)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <ForkKnife size={24} weight="fill" className="text-[var(--color-white)]" />
            <div>
                <span className="text-lg font-bold text-[var(--color-white)] sm:text-xl">
                  ROC Passaporte
                </span>
                <span className="ml-2 hidden text-sm text-white/60 sm:inline">
                  | Portal do Lojista
                </span>
            </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--color-roc-success)]" />
              <span className="text-xs text-white/70 sm:text-sm">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Choice Mode - Selecionar método de validação */}
          {mode === "choice" && validationStatus === "idle" && (
            <div className="space-y-4">
              {/* Welcome Card */}
              <div className="rounded-2xl bg-[var(--color-white)] p-6 text-center shadow-large sm:rounded-3xl sm:p-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--color-roc-primary)] to-[var(--color-roc-primary-light)] shadow-medium sm:mb-5 sm:h-16 sm:w-16">
                  <Sparkle size={28} weight="fill" className="text-[var(--color-white)] sm:w-8 sm:h-8" />
                </div>
                <h1 className="mb-2 text-xl font-bold text-[var(--color-text-dark)] sm:text-2xl">
                  Validar Cupom
                </h1>
                <p className="text-sm text-[var(--color-text-medium)] sm:text-base">
                  Escolha como deseja validar o cupom do cliente
                </p>
      </div>

              {/* Opções de Validação */}
              <div className="grid gap-3 sm:gap-4">
                {/* Opção QR Code Scanner */}
                <button
                  onClick={() => {
                    setMode("scanner");
                  }}
                  className="group rounded-xl border-2 border-transparent bg-[var(--color-white)] p-4 text-left shadow-medium transition-all hover:border-[var(--color-roc-primary)]/30 hover:bg-[var(--color-white)]/80 sm:rounded-2xl sm:p-5"
          >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-roc-primary)]/10 transition-colors group-hover:bg-[var(--color-roc-primary)]/20 sm:h-14 sm:w-14">
                      <QrCode size={28} weight="fill" className="text-[var(--color-roc-primary)]" />
        </div>
                    <div className="flex-1">
                      <h3 className="mb-0.5 text-base font-semibold text-[var(--color-text-dark)] sm:text-lg">
                        Escanear QR Code
                      </h3>
                      <p className="text-xs text-[var(--color-text-medium)] sm:text-sm">
                        Use a câmera para ler o código
                      </p>
                    </div>
                    <div className="hidden text-[var(--color-roc-primary)] opacity-0 transition-opacity group-hover:opacity-100 sm:block">
                      →
                    </div>
              </div>
            </button>

                {/* Opção Digitar Código */}
            <button
                  onClick={() => setMode("manual")}
                  className="group rounded-xl border-2 border-transparent bg-[var(--color-white)] p-4 text-left shadow-medium transition-all hover:border-[var(--color-roc-accent)]/30 hover:bg-[var(--color-white)]/80 sm:rounded-2xl sm:p-5"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-roc-accent)]/10 transition-colors group-hover:bg-[var(--color-roc-accent)]/20 sm:h-14 sm:w-14">
                      <Keyboard size={28} weight="fill" className="text-[var(--color-roc-accent)]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-0.5 text-base font-semibold text-[var(--color-text-dark)] sm:text-lg">
                        Digitar Código
                      </h3>
                      <p className="text-xs text-[var(--color-text-medium)] sm:text-sm">
                        Insira o código manualmente
                      </p>
                    </div>
                    <div className="hidden text-[var(--color-roc-accent)] opacity-0 transition-opacity group-hover:opacity-100 sm:block">
                      →
                    </div>
              </div>
            </button>
          </div>

              {/* Texto de Ajuda */}
              <p className="px-4 text-center text-xs text-white/50 sm:text-sm">
                O cupom será marcado como utilizado automaticamente após a validação
              </p>
            </div>
          )}

          {/* Manual Input Mode */}
          {mode === "manual" && validationStatus === "idle" && (
            <div className="rounded-2xl bg-[var(--color-white)] p-6 shadow-large sm:rounded-3xl sm:p-8">
              <button
                onClick={() => setMode("choice")}
                className="mb-6 flex items-center gap-2 text-sm text-[var(--color-text-medium)] transition-colors hover:text-[var(--color-text-dark)]"
              >
                <ArrowLeft size={16} weight="bold" />
                Voltar
              </button>

              <div className="mb-6 text-center sm:mb-8">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-roc-accent)]/10 sm:h-16 sm:w-16">
                  <Keyboard size={28} weight="fill" className="text-[var(--color-roc-accent)]" />
                </div>
                <h1 className="mb-2 text-xl font-bold text-[var(--color-text-dark)] sm:text-2xl">
                  Digitar Código
                </h1>
                <p className="text-sm text-[var(--color-text-medium)]">
                  Digite o código ROC-XXXXX do cupom
              </p>
            </div>

              <form onSubmit={handleManualSubmit} className="space-y-4 sm:space-y-5">
                <div>
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) =>
                      setInputCode(
                        e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "")
                      )
                    }
                    className="w-full rounded-xl border-2 border-[var(--color-border)] bg-[var(--color-bg-light)] px-4 py-3 text-center text-xl tracking-[0.3em] font-mono uppercase outline-none transition-all focus:border-[var(--color-roc-primary)] focus:ring-2 focus:ring-[var(--color-roc-primary)]/20 sm:px-5 sm:py-4 sm:text-2xl"
                    placeholder="ROC-XXXXX"
                    maxLength={9}
                    autoFocus
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck="false"
                  />
                  <p className="mt-2 text-center text-xs text-[var(--color-text-medium)]">
                    {inputCode.length}/9 caracteres
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={inputCode.length !== 9}
                  className="w-full rounded-xl bg-gradient-to-r from-[var(--color-roc-primary)] to-[var(--color-roc-primary-light)] px-4 py-3 text-sm font-semibold text-[var(--color-white)] shadow-medium transition-all hover:shadow-large disabled:cursor-not-allowed disabled:opacity-50 sm:py-4 sm:text-base"
                >
                  Validar Cupom
                </button>
              </form>
            </div>
          )}


          {/* Validating State */}
          {validationStatus === "validating" && (
            <div className="rounded-2xl bg-[var(--color-white)] p-8 shadow-large sm:rounded-3xl sm:p-10">
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-roc-primary)]/10 sm:mb-6 sm:h-20 sm:w-20">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-roc-primary)]/30 border-t-[var(--color-roc-primary)] sm:h-12 sm:w-12" />
                </div>
                <h2 className="mb-2 text-lg font-bold text-[var(--color-text-dark)] sm:text-xl">
                  Validando...
                </h2>
                <p className="text-sm text-[var(--color-text-medium)]">Verificando o código do cupom</p>
              </div>
            </div>
          )}

          {/* Success State */}
          {validationStatus === "success" && (
            <div className="animate-scale-in rounded-2xl border-2 border-[var(--color-roc-success)]/50 bg-gradient-to-br from-[var(--color-roc-success)]/20 to-[var(--color-roc-success)]/10 p-6 shadow-large sm:rounded-3xl sm:p-8">
              <div className="text-center">
                <div
                  className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-full bg-[var(--color-roc-success)] shadow-medium sm:mb-6 sm:h-20 sm:w-20"
                  style={{
                    boxShadow: "0 0 40px rgba(34, 139, 34, 0.4)",
                  }}
                >
                  <CheckCircle size={36} weight="fill" className="text-[var(--color-white)] sm:w-10 sm:h-10" />
                </div>

                <h1 className="mb-2 text-xl font-bold text-[var(--color-roc-success)] sm:text-2xl">
                  Cupom Validado!
                </h1>
                <p className="mb-6 text-sm text-[var(--color-text-medium)]">
                  O cupom foi utilizado com sucesso
                </p>

                {couponInfo && (
                  <div className="mb-6 space-y-3 rounded-xl bg-[var(--color-white)]/80 p-4 text-left backdrop-blur-sm sm:space-y-4 sm:rounded-2xl sm:p-5">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-roc-primary)]/10 sm:h-10 sm:w-10">
                        <Storefront size={16} weight="fill" className="text-[var(--color-roc-primary)]" />
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-[var(--color-text-medium)]">Restaurante</p>
                        <p className="text-sm font-medium text-[var(--color-text-dark)] sm:text-base">
                          {couponInfo.restaurant}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-roc-accent)]/10 sm:h-10 sm:w-10">
                        <Tag size={16} weight="fill" className="text-[var(--color-roc-accent)]" />
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-[var(--color-text-medium)]">Oferta</p>
                        <p className="text-sm font-medium text-[var(--color-text-dark)] sm:text-base">
                          {couponInfo.offer}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--color-roc-success)]/10 sm:h-10 sm:w-10">
                        <Clock size={16} weight="fill" className="text-[var(--color-roc-success)]" />
                      </div>
                      <div>
                        <p className="mb-1 text-xs text-[var(--color-text-medium)]">Validado em</p>
                        <p className="text-sm font-medium text-[var(--color-text-dark)] sm:text-base">
                          {new Date().toLocaleString("pt-BR", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-dark)] transition-colors hover:bg-[var(--color-bg-light)] sm:px-6 sm:py-3 sm:text-base"
                >
                  <ArrowClockwise size={16} weight="bold" />
                  Validar outro cupom
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {validationStatus === "error" && (
            <div className="animate-scale-in rounded-2xl border-2 border-[var(--color-roc-danger)]/50 bg-gradient-to-br from-[var(--color-roc-danger)]/20 to-[var(--color-roc-danger)]/10 p-6 shadow-large sm:rounded-3xl sm:p-8">
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-full bg-[var(--color-roc-danger)] sm:mb-6 sm:h-20 sm:w-20">
                  <XCircle size={36} weight="fill" className="text-[var(--color-white)] sm:w-10 sm:h-10" />
                </div>

                <h1 className="mb-2 text-xl font-bold text-[var(--color-roc-danger)] sm:text-2xl">
                  Cupom Inválido
                </h1>

                <p className="mx-auto mb-6 max-w-xs text-sm text-[var(--color-text-medium)]">
                  O código informado não foi encontrado ou já foi utilizado anteriormente.
                </p>

                <div className="mb-6 rounded-xl bg-[var(--color-white)]/80 p-4 backdrop-blur-sm">
                  <p className="mb-1 text-xs text-[var(--color-text-medium)]">Código digitado:</p>
                  <p className="font-mono text-lg tracking-wider text-[var(--color-text-dark)]">
                    {inputCode || "—"}
                  </p>
                </div>

                <div className="flex flex-col gap-3 justify-center sm:flex-row">
              <button
                    onClick={handleReset}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] px-5 py-2.5 text-sm font-medium text-[var(--color-text-dark)] transition-colors hover:bg-[var(--color-bg-light)]"
              >
                    <ArrowClockwise size={16} weight="bold" />
                    Tentar novamente
              </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-3 text-center sm:py-4">
        <p className="text-xs text-white/50 sm:text-sm">
          © 2026 ROC Passaporte — Portal do Lojista. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
