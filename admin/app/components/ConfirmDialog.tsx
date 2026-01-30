"use client";

import { AnimatePresence, motion } from "framer-motion";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: "danger" | "primary";
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmar",
  variant = "primary",
}: ConfirmDialogProps) {
  const confirmButtonClass =
    variant === "danger"
      ? "bg-[var(--color-roc-danger)] hover:bg-red-700 text-white"
      : "bg-[var(--color-roc-primary)] hover:bg-[var(--color-roc-primary-dark)] text-white";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          {/* Dialog card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative z-10 w-full max-w-md mx-4 bg-white rounded-xl shadow-medium p-6"
          >
            {/* Title */}
            <h3 className="text-lg font-semibold text-[var(--color-text-dark)]">
              {title}
            </h3>

            {/* Message */}
            <p className="mt-2 text-sm text-[var(--color-text-medium)] leading-relaxed">
              {message}
            </p>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium
                  text-[var(--color-text-medium)] bg-gray-100 hover:bg-gray-200
                  transition-colors duration-150"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150
                  ${confirmButtonClass}`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
