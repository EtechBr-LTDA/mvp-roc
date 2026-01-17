"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraSlash, ArrowClockwise, Keyboard } from "@phosphor-icons/react";

interface QRScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isRunningRef = useRef<boolean>(false);

  const startScanner = async () => {
    if (!containerRef.current) return;

    try {
      setError(null);

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          // Successfully scanned
          onScan(decodedText.toUpperCase());
          stopScanner();
        },
        () => {
          // QR code not detected - silent fail
        }
      );

      setIsScanning(true);
      setHasPermission(true);
      isRunningRef.current = true;
    } catch (err: any) {
      console.error("Scanner error:", err);
      setHasPermission(false);
      isRunningRef.current = false;
      setIsScanning(false);

      if (err.message?.includes("Permission")) {
        setError("Permissão de câmera negada. Por favor, permita o acesso à câmera.");
      } else {
        setError("Não foi possível iniciar a câmera. Tente novamente.");
      }
    }
  };

  const stopScanner = async () => {
    // Só tentar parar se o scanner estiver realmente rodando
    if (!isRunningRef.current || !scannerRef.current) {
      scannerRef.current = null;
      setIsScanning(false);
      return;
    }

    try {
      await scannerRef.current.stop();
      isRunningRef.current = false;
    } catch (err: any) {
      // Ignorar silenciosamente erros quando o scanner não está rodando
      const errorMessage = String(err?.message || err || "").toLowerCase();
      const shouldIgnore = 
        errorMessage.includes("scanner is not running") ||
        errorMessage.includes("cannot stop") ||
        errorMessage.includes("not running or paused") ||
        errorMessage.includes("already stopped");
      
      if (!shouldIgnore) {
        console.error("Error stopping scanner:", err);
      }
      isRunningRef.current = false;
    } finally {
      try {
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
      } catch (err) {
        // Ignorar erro ao limpar silenciosamente
      }
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  useEffect(() => {
    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  // Remover blur dos elementos do html5-qrcode após iniciar
  useEffect(() => {
    if (isScanning) {
      const removeBlur = () => {
        const videoElements = document.querySelectorAll('#qr-reader video');
        const imgElements = document.querySelectorAll('#qr-reader img');
        const shadedRegion = document.querySelector('#qr-shaded-region');

        videoElements.forEach((el: any) => {
          if (el) {
            el.style.filter = 'none';
            el.style.webkitFilter = 'none';
            el.style.transform = 'none';
            el.style.opacity = '1';
          }
        });

        imgElements.forEach((el: any) => {
          if (el) {
            el.style.filter = 'none';
            el.style.webkitFilter = 'none';
            el.style.opacity = '1';
          }
        });

        if (shadedRegion) {
          const el = shadedRegion as HTMLElement;
          el.style.filter = 'none';
          el.style.backdropFilter = 'none';
          // Remover webkitBackdropFilter usando setProperty para evitar erro TypeScript
          el.style.setProperty('-webkit-backdrop-filter', 'none');
        }
      };

      // Executar imediatamente e periodicamente para garantir
      removeBlur();
      const interval = setInterval(removeBlur, 100);

      return () => clearInterval(interval);
    }
  }, [isScanning]);

  const handleRetry = () => {
    setError(null);
    startScanner();
  };

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen flex-col bg-[var(--color-bg-light)] backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--color-border)]/20 bg-[var(--color-white)]/50 px-[var(--spacing-4)] py-[var(--spacing-3)] backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-[var(--color-text-dark)]">Escanear QR Code</h2>
        <button
          onClick={() => {
            stopScanner();
            onClose();
          }}
          className="rounded-lg p-[var(--spacing-2)] text-[var(--color-text-medium)] transition-colors hover:bg-[var(--color-bg-light)]"
        >
          <CameraSlash size={20} weight="bold" />
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex flex-1 flex-col items-center justify-center p-[var(--spacing-4)]">
        {error ? (
          <div className="max-w-sm p-[var(--spacing-6)] text-center">
            <div className="mx-auto mb-[var(--spacing-4)] flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-roc-danger)]/10">
              <CameraSlash size={32} weight="fill" className="text-[var(--color-roc-danger)]" />
            </div>
            <p className="mb-[var(--spacing-4)] text-[var(--color-text-medium)]">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-[var(--spacing-2)] rounded-lg bg-[var(--color-roc-primary)] px-[var(--spacing-4)] py-[var(--spacing-2)] text-sm font-semibold text-[var(--color-white)] transition-colors hover:bg-[var(--color-roc-primary-dark)]"
            >
              <ArrowClockwise size={16} weight="bold" />
              Tentar novamente
            </button>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            {/* Scanner Container */}
            <div ref={containerRef} className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black shadow-large">
              <div id="qr-reader" className="h-full w-full [&_video]:!filter-none [&_video]:!blur-none [&_img]:!filter-none [&_img]:!blur-none" />

              {/* Scanning Overlay */}
              {isScanning && (
                <div className="pointer-events-none absolute inset-0 z-10">
                  {/* Quadrado branco semitransparente - SEM blur para não afetar a câmera */}
                  <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg sm:h-80 sm:w-80">
                    <div className="absolute inset-0 bg-[var(--color-white)]/20" />

                    {/* Cantos L - usando cor primária ROC */}
                    <div className="absolute -top-1 -left-1 h-12 w-12 border-l-4 border-t-4 border-[var(--color-roc-primary)]" />
                    <div className="absolute -top-1 -right-1 h-12 w-12 border-r-4 border-t-4 border-[var(--color-roc-primary)]" />
                    <div className="absolute -bottom-1 -left-1 h-12 w-12 border-l-4 border-b-4 border-[var(--color-roc-primary)]" />
                    <div className="absolute -bottom-1 -right-1 h-12 w-12 border-r-4 border-b-4 border-[var(--color-roc-primary)]" />

                    {/* Linha de varredura animada */}
                    <div className="absolute left-0 right-0 top-0 bottom-0 overflow-hidden">
                      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-roc-primary)] to-transparent animate-scan" />
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {!isScanning && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="flex flex-col items-center gap-[var(--spacing-3)]">
                    <Camera size={40} weight="fill" className="animate-pulse text-[var(--color-roc-primary)]" />
                    <p className="text-sm text-white/80">Iniciando câmera...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <p className="mt-[var(--spacing-4)] text-center text-base text-[var(--color-text-dark)]">
              Aponte a câmera para o QR Code do cupom do cliente
            </p>
          </div>
        )}
      </div>

      {/* Footer Hint */}
      <div className="border-t border-[var(--color-border)]/20 bg-[var(--color-white)]/50 px-[var(--spacing-4)] py-[var(--spacing-4)] text-center backdrop-blur-sm">
        <button
          onClick={() => {
            stopScanner();
            onClose();
          }}
          className="mx-auto flex items-center gap-[var(--spacing-2)] text-sm font-medium text-[var(--color-roc-primary)] transition-colors hover:text-[var(--color-roc-primary-dark)]"
        >
          <Keyboard size={18} weight="bold" />
          Ou digite o código manualmente
        </button>
      </div>
    </div>
  );
}

