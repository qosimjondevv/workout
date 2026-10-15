import React from "react";

export default function Header({ dateLabel }) {
  return (
    <div className="px-4 pt-5 pb-3 border-b border-brand-line">
      <div className="font-display text-[22px] font-bold tracking-wide uppercase text-brand-text">
        Temir <span className="text-brand-accent">Jurnal</span>
      </div>
      <div className="text-xs text-brand-muted mt-0.5">{dateLabel}</div>
    </div>
  );
}
