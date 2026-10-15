import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function SaveStatus({ syncing, saveError, onRetry }) {
  if (!saveError && !syncing) return null;

  if (!saveError) {
    return (
      <div className="pointer-events-none">
        <div className="inline-flex items-center gap-1.5 bg-brand-surface2/90 border border-brand-line rounded-full px-2.5 py-1">
          <RefreshCw size={11} className="text-brand-muted animate-spin" />
          <span className="text-[11px] text-brand-muted">Sinxronlanmoqda...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 bg-brand-accent2/15 border border-brand-accent2/40 rounded-md px-3 py-2">
        <AlertTriangle size={15} className="text-brand-accent2 shrink-0" />
        <div className="text-[12px] text-brand-text flex-1">{saveError}</div>
        <button
          onClick={onRetry}
          className="text-[12px] font-semibold text-brand-accent2 bg-transparent border-none cursor-pointer shrink-0"
        >
          Qayta urinish
        </button>
      </div>
    </div>
  );
}
