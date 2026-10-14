import React, { useRef } from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "../utils/cn.js";
import { dateLabel } from "../utils/date.js";

// Sana maydoni. Brauzerning <input type="date"> i tizim tiliga qarab
// "10/14/2026" ko'rsatadi — ilovaning qolgan qismi esa "14.10.2026".
// Shuning uchun matnni O'ZIMIZ chizamiz ("Bugun, 14.10.2026"), tanlash
// oynasi esa brauzerning o'zi (telefonda tizim kalendari) bo'lib qoladi.
export function DateField({ value, onChange, className, ariaLabel = "Sana" }) {
  const inputRef = useRef(null);

  function openPicker() {
    const el = inputRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      try {
        el.showPicker();
        return;
      } catch {
        // Ba'zi brauzerlar showPicker'ni cheklaydi — pastdagi usulga o'tamiz.
      }
    }
    el.focus();
    el.click();
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={openPicker}
        aria-label={`${ariaLabel}: ${dateLabel(value)}`}
        className={cn(
          "w-full h-10 rounded-md border border-brand-line bg-brand-surface2 px-3",
          "flex items-center gap-2 text-sm text-left cursor-pointer transition-colors",
          "hover:border-brand-muted focus:outline-none focus:border-brand-accent",
          value ? "text-brand-text" : "text-brand-muted",
        )}
      >
        <CalendarDays size={15} className="text-brand-muted shrink-0" />
        <span className="truncate">{dateLabel(value)}</span>
      </button>
      <input
        ref={inputRef}
        type="date"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
      />
    </div>
  );
}
