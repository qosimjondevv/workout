import React, { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./button.jsx";

// SOF UI, qayta ishlatiladigan modal. Hech qanday hook/context yo'q.
// Kim beradi: uni chaqirgan component o'zining "open" holatini boshqaradi
// (masalan HistoryItem.jsx dagi useState(confirmOpen)).
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "O'chirish",
  cancelLabel = "Bekor qilish",
  onConfirm,
  onCancel,
}) {
  // Escape bilan yopish + modal ochiq turganda fon aylanmasin.
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onCancel?.();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-brand-surface border border-brand-line rounded-lg p-4 w-full max-w-[320px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="font-display text-sm uppercase tracking-wide text-brand-text mb-1.5">
          {title}
        </div>
        <div className="text-[13px] text-brand-muted mb-4">{message}</div>
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            className="bg-brand-accent2/15 text-brand-accent2"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Umumiy modal qobiq: sarlavha + ixtiyoriy mazmun. ConfirmDialog bilan bir xil
// xulq (Escape, fonga bosish, fon aylanmaydi), lekin ichini chaqiruvchi to'ldiradi.
export function Modal({ open, title, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return undefined;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-brand-surface border border-brand-line rounded-t-lg sm:rounded-lg p-4 w-full max-w-[440px] max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="font-display text-sm uppercase tracking-wide text-brand-text">
            {title}
          </div>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-brand-muted cursor-pointer p-1"
          >
            <X size={16} />
          </button>
        </div>

        {children}

        {footer && <div className="mt-4">{footer}</div>}
      </div>
    </div>
  );
}
