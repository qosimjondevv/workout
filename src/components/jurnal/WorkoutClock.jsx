import React, { useEffect, useState } from "react";
import { Clock, Play, Square } from "lucide-react";
import { Button } from "../../ui/button.jsx";
import { cn } from "../../utils/cn.js";
import { formatClock } from "../../utils/date.js";
import { MAX_WORKOUT_SECONDS, elapsedWorkoutSec, isClockRunning } from "../../utils/workout.js";

export default function WorkoutClock({ form, readOnly, onStart, onStop }) {
  const running = isClockRunning(form);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running]);

  const elapsed = elapsedWorkoutSec(form, Math.max(now, Number(form.startedAt) || 0));
  const overLimit = elapsed > MAX_WORKOUT_SECONDS;

  if (readOnly && !elapsed) return null;

  const status = running ? "Davom etmoqda" : elapsed ? "To'xtatilgan" : "Boshlanmagan";

  return (
    <div className="flex items-center gap-3 bg-brand-bg/60 border border-brand-line rounded-md px-3 py-2 mb-3">
      <Clock
        size={16}
        className={cn("shrink-0", running ? "text-brand-accent" : "text-brand-muted")}
      />
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-brand-muted leading-none">Mashg'ulot vaqti · {status}</div>
        <div
          className={cn(
            "font-display text-[20px] font-bold tabular-nums leading-tight",
            running ? "text-brand-accent" : "text-brand-text",
          )}
        >
          {formatClock(elapsed)}
        </div>
        {overLimit && (
          <div className="text-[10px] text-brand-accent2">5 soatdan oshdi — vaqt saqlanmaydi</div>
        )}
      </div>

      {!readOnly &&
        (running ? (
          <Button variant="secondary" size="sm" onClick={onStop} className="shrink-0">
            <Square size={12} className="fill-current" /> Tugatish
          </Button>
        ) : (
          <Button size="sm" onClick={onStart} className="shrink-0">
            <Play size={12} className="fill-current" /> {elapsed ? "Davom" : "Boshlash"}
          </Button>
        ))}
    </div>
  );
}
