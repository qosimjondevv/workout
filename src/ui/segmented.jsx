import React from "react";
import { cn } from "../utils/cn.js";

// Bir xil "yonma-yon tugmalar" naqshi ilovada bir necha joyda takrorlanardi
// (haftalik/oylik, vazn/soniya, bo'lim tanlash). Endi bitta komponent.
//
// options: [{ value, label, icon? }]
const SIZES = {
  sm: "text-[11px] py-1",
  md: "text-xs py-1.5",
  lg: "text-[13px] py-2",
};

export function SegmentedControl({
  value,
  onChange,
  options,
  size = "md",
  className,
}) {
  return (
    <div
      className={cn(
        "flex gap-1 p-1 bg-brand-surface2 border border-brand-line rounded-md",
        className,
      )}
      role="tablist"
    >
      {options.map((o) => {
        const active = o.value === value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 rounded font-semibold cursor-pointer transition-colors",
              SIZES[size],
              active
                ? "bg-brand-accent text-neutral-950"
                : "bg-transparent text-brand-muted hover:text-brand-text",
            )}
          >
            {Icon && <Icon size={13} />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
