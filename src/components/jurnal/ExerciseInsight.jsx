import React from "react";
import { Copy, Flame, TrendingUp } from "lucide-react";
import { fmt } from "../../utils/date.js";
import { formatSet } from "../../utils/workout.js";

export default function ExerciseInsight({ insight, unit, onUsePrevious, onApplySuggestion }) {
  if (!insight?.previous) return null;

  const isSeconds = unit === "seconds";
  const { previous, stats, suggestion } = insight;
  const prevSets = previous.exercise?.sets ?? [];

  const prLabel = isSeconds
    ? stats.bestTime
      ? `${stats.bestTime}s`
      : null
    : stats.bestWeight
      ? `${stats.bestWeight}kg`
      : null;

  const suggestionLabel = !suggestion
    ? null
    : suggestion.unit === "seconds"
      ? `${suggestion.seconds}s`
      : `${suggestion.weight}kg × ${suggestion.reps}`;

  return (
    <div className="bg-brand-bg/60 border border-brand-line rounded-md px-2.5 py-2 mb-2">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-brand-muted">Oxirgi marta · {fmt(previous.date)}</div>
          <div className="text-[12px] text-brand-text truncate">
            {prevSets.map((s) => formatSet(unit, s)).join(", ") || "-"}
          </div>
        </div>

        <button
          type="button"
          onClick={onUsePrevious}
          title="Oldingi natijani nusxalash"
          className="flex items-center gap-1 text-[11px] text-brand-text bg-brand-surface2 border border-brand-line rounded px-2 py-1 cursor-pointer shrink-0"
        >
          <Copy size={11} /> Nusxalash
        </button>
      </div>

      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
        {prLabel && (
          <span className="flex items-center gap-1 text-[11px] text-brand-muted">
            <Flame size={11} className="text-brand-accent" /> PR {prLabel}
          </span>
        )}
        {!isSeconds && stats.best1RM > 0 && (
          <span className="text-[11px] text-brand-muted">1RM ~{stats.best1RM}kg</span>
        )}
      </div>

      {suggestionLabel && (
        <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-brand-line">
          <TrendingUp size={12} className="text-brand-accent shrink-0" />
          <span className="text-[11px] text-brand-muted flex-1">
            Keyingi qadam:{" "}
            <span className="text-brand-accent font-semibold">{suggestionLabel}</span>
          </span>
          <button
            type="button"
            onClick={onApplySuggestion}
            className="text-[11px] font-semibold text-brand-accent bg-brand-accent/10 border border-brand-accent/40 rounded px-2 py-1 cursor-pointer shrink-0"
          >
            Qabul qilish
          </button>
        </div>
      )}
    </div>
  );
}
