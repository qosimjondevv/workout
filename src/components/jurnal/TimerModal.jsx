import React, { useEffect } from "react";
import { Play, Pause, X } from "lucide-react";
import { Button } from "../../ui/button.jsx";
import { TIMER_PRESETS } from "../../constants/timerPresets.js";
import { useCountdownTimer } from "../../hooks/useCountdownTimer.js";

export default function TimerModal({ onCancel, onComplete }) {
  const timer = useCountdownTimer(onComplete);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onCancel?.();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const mm = String(Math.floor(timer.remaining / 60)).padStart(2, "0");
  const ss = String(timer.remaining % 60).padStart(2, "0");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-brand-surface border border-brand-line rounded-lg p-5 w-full max-w-[320px] text-center">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 bg-transparent border-none text-brand-muted cursor-pointer"
        >
          <X size={18} />
        </button>

        {timer.duration === null ? (
          <>
            <div className="font-display text-sm uppercase tracking-wide text-brand-text mb-4 mt-1">
              Vaqtni tanlang
            </div>
            <div className="grid grid-cols-2 gap-2">
              {TIMER_PRESETS.map((p) => (
                <button
                  key={p.seconds}
                  onClick={() => timer.start(p.seconds)}
                  className="py-2.5 rounded-md border border-brand-line bg-brand-surface2 text-brand-text text-sm font-semibold cursor-pointer hover:border-brand-accent"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="text-xs text-brand-muted mt-1 mb-1">Mashq davom etmoqda</div>
            <div className="font-display text-5xl font-bold text-brand-accent tabular-nums mb-6">
              {mm}:{ss}
            </div>
            <div className="flex gap-2 justify-center">
              {timer.remaining === 0 ? (
                <div className="text-brand-accent text-sm font-semibold">Saqlanmoqda...</div>
              ) : timer.running ? (
                <Button variant="secondary" onClick={timer.pause}>
                  <Pause size={16} /> Pauza
                </Button>
              ) : (
                <Button onClick={timer.resume}>
                  <Play size={16} /> Davom etish
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
