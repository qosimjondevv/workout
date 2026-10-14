import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "../../ui/card.jsx";
import { cn } from "../../utils/cn.js";
import { WEEKDAY_LABELS } from "../../utils/date.js";

// Mashg'ulot kalendari: mashq bo'lgan kunlar salatiy nuqta bilan belgilanadi,
// bugungi kun halqa bilan ajratiladi. Kun bosilsa o'sha kundagi yozuv ochiladi.
export default function WorkoutCalendar({
  label,
  weeks,
  byDate,
  today,
  monthStats,
  onPrev,
  onNext,
  onSelect,
}) {
  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={onPrev}
          className="bg-transparent border-none text-brand-muted cursor-pointer p-1"
        >
          <ChevronLeft size={18} />
        </button>
        <div className="text-center">
          <div className="font-display text-[14px] uppercase tracking-wide text-brand-text">
            {label}
          </div>
          <div className="text-[10px] text-brand-muted">
            {monthStats.workouts} mashg'ulot · {monthStats.days} kun
          </div>
        </div>
        <button
          onClick={onNext}
          className="bg-transparent border-none text-brand-muted cursor-pointer p-1"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[10px] text-brand-muted">
            {d}
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        {weeks.map((week) => (
          <div key={week[0].iso} className="grid grid-cols-7 gap-1">
            {week.map((day) => {
              const count = byDate.get(day.iso)?.length ?? 0;
              const isToday = day.iso === today;
              return (
                <button
                  key={day.iso}
                  onClick={() => count && onSelect(day.iso)}
                  disabled={!count}
                  className={cn(
                    "aspect-square rounded-md flex flex-col items-center justify-center gap-0.5 border text-[11px] transition-colors",
                    count
                      ? "cursor-pointer border-brand-line bg-brand-surface2 text-brand-text hover:border-brand-accent"
                      : "border-transparent bg-transparent",
                    !day.inMonth && "opacity-35",
                    isToday && "border-brand-accent",
                  )}
                >
                  <span className={cn(!count && "text-brand-muted")}>
                    {Number(day.iso.slice(8, 10))}
                  </span>
                  {count > 0 && (
                    <span className="w-1 h-1 rounded-full bg-brand-accent" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
}
