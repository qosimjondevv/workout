import React from "react";
import { Check, Flame, Timer, X } from "lucide-react";
import { Input } from "../../ui/input.jsx";
import { cn } from "../../utils/cn.js";
import { toStr } from "../../utils/num.js";

// Bitta set qatori: [№] [kg] × [marta] [🔥] [✓] [×]
//
// placeholder — oldingi mashg'ulotdagi SHU tartibdagi set (kulrang matn).
// ✓ bosilganda bo'sh maydonlar aynan shu qiymat bilan to'ldiriladi, ya'ni
// "o'tgan safargidek" setni bitta bosish bilan yozish mumkin.
export default function SetRow({
  index,
  unit,
  set,
  placeholder,
  goalReps,
  isRecord,
  canComplete,
  onChange,
  onToggleDone,
  onRemove,
  onStartTimer,
}) {
  const done = Boolean(set.done);
  const isSeconds = unit === "seconds";

  const inputClass = cn(
    "h-9 text-[13px] text-center px-1.5 bg-brand-bg",
    done && "border-brand-accent/40",
  );

  return (
    <div
      className={cn(
        "flex gap-1.5 items-center mb-1 rounded-md -mx-1 px-1 py-0.5 transition-colors",
        done && "bg-brand-accent/10",
      )}
    >
      <span
        className={cn(
          "text-[11px] w-4 text-center shrink-0 tabular-nums",
          done ? "text-brand-accent font-semibold" : "text-brand-muted",
        )}
      >
        {index + 1}
      </span>

      {isSeconds ? (
        <>
          <Input
            type="number"
            inputMode="numeric"
            placeholder={toStr(placeholder?.seconds) || "soniya"}
            value={set.seconds}
            onChange={(e) => onChange("seconds", e.target.value)}
            aria-label={`${index + 1}-set, soniya`}
            className={inputClass}
          />
          <span className="text-[11px] text-brand-muted shrink-0">s</span>
          <button
            type="button"
            onClick={onStartTimer}
            title="Taymer bilan o'lchash"
            aria-label="Taymer bilan o'lchash"
            className="h-9 w-9 shrink-0 flex items-center justify-center rounded-md border border-brand-line bg-brand-bg text-brand-muted cursor-pointer hover:text-brand-accent"
          >
            <Timer size={14} />
          </button>
        </>
      ) : (
        <>
          <Input
            type="number"
            inputMode="decimal"
            placeholder={toStr(placeholder?.weight) || "kg"}
            value={set.weight}
            onChange={(e) => onChange("weight", e.target.value)}
            aria-label={`${index + 1}-set, vazn (kg)`}
            className={inputClass}
          />
          <span className="text-[11px] text-brand-muted shrink-0">×</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder={toStr(placeholder?.reps) || goalReps || "marta"}
            value={set.reps}
            onChange={(e) => onChange("reps", e.target.value)}
            aria-label={`${index + 1}-set, takror`}
            className={inputClass}
          />
        </>
      )}

      <span className="w-4 shrink-0 flex justify-center" aria-hidden={!isRecord}>
        {isRecord && (
          <Flame size={14} className="text-brand-accent" aria-label="Yangi rekord" />
        )}
      </span>

      <button
        type="button"
        onClick={onToggleDone}
        disabled={!done && !canComplete}
        aria-pressed={done}
        aria-label={done ? "Bajarilmagan deb belgilash" : "Bajarildi deb belgilash"}
        className={cn(
          "h-9 w-9 shrink-0 flex items-center justify-center rounded-md border transition-colors",
          done
            ? "bg-brand-accent border-brand-accent text-neutral-950 cursor-pointer"
            : "bg-brand-bg border-brand-line text-brand-muted cursor-pointer hover:border-brand-accent hover:text-brand-accent",
          "disabled:opacity-30 disabled:cursor-default disabled:hover:border-brand-line disabled:hover:text-brand-muted",
        )}
      >
        <Check size={16} strokeWidth={done ? 3 : 2} />
      </button>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`${index + 1}-setni o'chirish`}
        className="bg-transparent border-none text-brand-muted cursor-pointer p-0.5 shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}
