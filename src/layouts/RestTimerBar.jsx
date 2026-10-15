import React from "react";
import { Pause, Play, Plus, SkipForward, Timer } from "lucide-react";

export default function RestTimerBar({
  active,
  remaining,
  running,
  onPause,
  onResume,
  onExtend,
  onSkip,
  onEdit,
}) {
  if (!active) return null;

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const done = remaining === 0;

  return (
    <div className="flex items-center gap-2 bg-brand-surface2 border border-brand-accent/50 rounded-md px-3 py-2">
      <Timer size={15} className="text-brand-accent shrink-0" />

      <button
        type="button"
        onClick={onEdit}
        aria-label="Dam olish vaqtini o'zgartirish"
        title="Vaqtni o'zgartirish"
        className="flex-1 min-w-0 text-left bg-transparent border-none p-0 cursor-pointer"
      >
        <span className="block text-[10px] text-brand-muted leading-none">
          {done ? "Dam tugadi" : "Dam olish"}
        </span>
        <span className="block font-display text-[18px] font-bold text-brand-accent tabular-nums leading-tight">
          {mm}:{ss}
        </span>
      </button>

      <button
        onClick={() => onExtend(30)}
        aria-label="30 soniya qo'shish"
        className="text-[11px] font-semibold text-brand-text bg-brand-surface border border-brand-line rounded px-2 py-1 cursor-pointer shrink-0 flex items-center gap-0.5"
      >
        <Plus size={11} />
        30s
      </button>

      {!done &&
        (running ? (
          <button
            onClick={onPause}
            title="Pauza"
            aria-label="Pauza"
            className="bg-transparent border-none text-brand-muted cursor-pointer p-1 shrink-0"
          >
            <Pause size={16} />
          </button>
        ) : (
          <button
            onClick={onResume}
            title="Davom etish"
            aria-label="Davom etish"
            className="bg-transparent border-none text-brand-accent cursor-pointer p-1 shrink-0"
          >
            <Play size={16} />
          </button>
        ))}

      <button
        onClick={onSkip}
        title="O'tkazib yuborish"
        aria-label="O'tkazib yuborish"
        className="bg-transparent border-none text-brand-muted cursor-pointer p-1 shrink-0"
      >
        <SkipForward size={16} />
      </button>
    </div>
  );
}
