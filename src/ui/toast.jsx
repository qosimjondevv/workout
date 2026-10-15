import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Flame, Info, AlertTriangle } from "lucide-react";
import { cn } from "../utils/cn.js";

const ToastContext = createContext(null);

const TONES = {
  success: {
    icon: CheckCircle2,
    className: "border-brand-accent/50",
    iconClass: "text-brand-accent",
  },
  record: {
    icon: Flame,
    className: "border-brand-accent bg-brand-accent/10",
    iconClass: "text-brand-accent",
  },
  error: {
    icon: AlertTriangle,
    className: "border-brand-accent2/60",
    iconClass: "text-brand-accent2",
  },
  info: { icon: Info, className: "border-brand-line", iconClass: "text-brand-muted" },
};

const MAX_VISIBLE = 3;
let nextId = 1;

function ToastItem({ toast, onDismiss }) {
  const tone = TONES[toast.tone] ?? TONES.info;
  const Icon = tone.icon;

  useEffect(() => {
    const id = setTimeout(() => onDismiss(toast.id), toast.duration);
    return () => clearTimeout(id);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <button
      type="button"
      onClick={() => onDismiss(toast.id)}
      className={cn(
        "pointer-events-auto w-full flex items-start gap-2.5 text-left bg-brand-surface2 border rounded-md px-3 py-2.5 shadow-lg cursor-pointer",
        tone.className,
      )}
    >
      <Icon size={18} className={cn("shrink-0 mt-px", tone.iconClass)} />
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-brand-text">{toast.title}</span>
        {toast.description && (
          <span className="block text-[12px] text-brand-muted mt-0.5">{toast.description}</span>
        )}
      </span>
    </button>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(({ title, description = "", tone = "info", duration = 3500 }) => {
    const id = nextId++;
    setToasts((list) => [...list, { id, title, description, tone, duration }].slice(-MAX_VISIBLE));
    return id;
  }, []);

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed top-3 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 z-[60] flex flex-col gap-2 pointer-events-none"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast() faqat <ToastProvider> ichida ishlaydi");
  return ctx;
}
