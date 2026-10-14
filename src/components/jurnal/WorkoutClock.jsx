import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { formatClock, formatDuration } from "../../utils/date.js";
import { MAX_WORKOUT_SECONDS } from "../../utils/workout.js";

// Mashg'ulot sekundomeri. Har soniyada FAQAT shu kichik komponent qayta
// render bo'ladi — butun forma emas.
//   startedAt  -> jonli sanoq (birinchi ✓ dan boshlanadi)
//   durationSec -> tahrirlanayotgan eski yozuvning saqlangan davomiyligi
export default function WorkoutClock({ startedAt, durationSec }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!startedAt) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  if (startedAt) {
    const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));
    // 5 soatdan oshsa — qoralama ochiq qolib ketgan; saqlanmaydi ham.
    if (elapsed > MAX_WORKOUT_SECONDS) return null;
    return (
      <span
        className="flex items-center gap-1 text-[12px] font-semibold text-brand-accent tabular-nums"
        title="Mashg'ulot davomiyligi"
      >
        <Clock size={12} /> {formatClock(elapsed)}
      </span>
    );
  }

  if (durationSec) {
    return (
      <span className="flex items-center gap-1 text-[11px] text-brand-muted" title="Saqlangan davomiylik">
        <Clock size={11} /> {formatDuration(durationSec)}
      </span>
    );
  }

  return null;
}
