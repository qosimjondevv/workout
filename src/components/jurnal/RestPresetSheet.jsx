import React, { useState } from "react";
import { Check, Minus, Play, Plus } from "lucide-react";
import { Modal } from "../../ui/dialog.jsx";
import { Button } from "../../ui/button.jsx";
import { cn } from "../../utils/cn.js";
import { formatClock } from "../../utils/date.js";
import { useRestTimerActions } from "../../context/RestTimerContext.jsx";
import {
  MAX_REST_SECONDS,
  MIN_REST_SECONDS,
  REST_PRESETS,
  REST_STEP_SECONDS,
  normalizeRestSeconds,
} from "../../constants/restPresets.js";

export default function RestPresetSheet({ onClose }) {
  const { start, saveDefault, defaultSeconds } = useRestTimerActions();
  const [seconds, setSeconds] = useState(defaultSeconds);
  const [makeDefault, setMakeDefault] = useState(false);

  const step = (delta) => setSeconds((s) => normalizeRestSeconds(s + delta));
  const isDefault = seconds === defaultSeconds;

  function handleStart() {
    if (makeDefault && !isDefault) saveDefault(seconds);
    start(seconds);
    onClose();
  }

  return (
    <Modal
      open
      title="Dam olish vaqti"
      onClose={onClose}
      footer={
        <Button
          onClick={handleStart}
          className="w-full font-display uppercase tracking-wide text-sm"
        >
          <Play size={14} className="fill-current" /> Boshlash · {formatClock(seconds)}
        </Button>
      }
    >
      <div className="flex items-center justify-center gap-4 mb-1">
        <button
          type="button"
          onClick={() => step(-REST_STEP_SECONDS)}
          disabled={seconds <= MIN_REST_SECONDS}
          aria-label={`${REST_STEP_SECONDS} soniya kamaytirish`}
          className="h-11 w-11 flex items-center justify-center rounded-full border border-brand-line bg-brand-surface2 text-brand-text cursor-pointer hover:border-brand-accent disabled:opacity-30 disabled:cursor-default"
        >
          <Minus size={18} />
        </button>
        <div className="text-center min-w-[110px]">
          <div className="font-display text-[40px] font-bold text-brand-accent tabular-nums leading-none">
            {formatClock(seconds)}
          </div>
          <div className="text-[10px] text-brand-muted mt-1">
            {isDefault ? "standart" : `standart: ${formatClock(defaultSeconds)}`}
          </div>
        </div>
        <button
          type="button"
          onClick={() => step(REST_STEP_SECONDS)}
          disabled={seconds >= MAX_REST_SECONDS}
          aria-label={`${REST_STEP_SECONDS} soniya qo'shish`}
          className="h-11 w-11 flex items-center justify-center rounded-full border border-brand-line bg-brand-surface2 text-brand-text cursor-pointer hover:border-brand-accent disabled:opacity-30 disabled:cursor-default"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="grid grid-cols-5 gap-1.5 mt-4">
        {REST_PRESETS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSeconds(s)}
            aria-pressed={seconds === s}
            className={cn(
              "py-2 rounded-md border text-[13px] font-semibold tabular-nums cursor-pointer transition-colors",
              seconds === s
                ? "border-brand-accent text-brand-accent bg-brand-accent/10"
                : "border-brand-line text-brand-text bg-brand-surface2 hover:border-brand-accent",
            )}
          >
            {formatClock(s)}
          </button>
        ))}
      </div>

      {!isDefault && (
        <button
          type="button"
          onClick={() => setMakeDefault((v) => !v)}
          aria-pressed={makeDefault}
          className="w-full flex items-center gap-2 mt-4 px-3 py-2 rounded-md border border-brand-line bg-transparent text-left cursor-pointer"
        >
          <span
            className={cn(
              "w-4 h-4 shrink-0 rounded flex items-center justify-center border",
              makeDefault
                ? "bg-brand-accent border-brand-accent text-neutral-950"
                : "border-brand-muted",
            )}
          >
            {makeDefault && <Check size={12} strokeWidth={3} />}
          </span>
          <span className="text-[12px] text-brand-text">
            Standart qilib saqlash
            <span className="block text-[10px] text-brand-muted">
              Keyingi setlarda dam olish shu vaqt bilan boshlanadi
            </span>
          </span>
        </button>
      )}
    </Modal>
  );
}
