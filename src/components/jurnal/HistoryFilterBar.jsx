import React from "react";
import { cn } from "../../utils/cn.js";

const OPTIONS = [
  { l: "7k", v: 7 },
  { l: "30k", v: 30 },
  { l: "Hammasi", v: "all" },
];

export default function HistoryFilterBar({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {OPTIONS.map((o) => (
        <button
          key={o.l}
          onClick={() => onChange(o.v)}
          className={cn(
            "text-[11px] px-2 py-1 rounded border cursor-pointer",
            value === o.v
              ? "border-brand-accent bg-brand-accent/15 text-brand-accent"
              : "border-brand-line bg-transparent text-brand-muted",
          )}
        >
          {o.l}
        </button>
      ))}
    </div>
  );
}
