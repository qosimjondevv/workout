import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, History } from "lucide-react";
import TypeBadge from "../shared/TypeBadge.jsx";
import { dateLabel, formatDuration } from "../../utils/date.js";
import { formatCompact } from "../../utils/num.js";
import { workoutVolume } from "../../utils/metrics.js";

// Jurnal sahifasining pastida: faqat OXIRGI mashg'ulot qisqacha. To'liq
// ro'yxat, tahrirlash va o'chirish — "Tarix" tabida (ilgari ikki sahifada
// bir xil ro'yxat takrorlanardi).
export default function LastWorkoutCard({ workout }) {
  if (!workout) return null;

  const exercises = workout.exercises ?? [];
  const sets = exercises.reduce((n, e) => n + (e.sets?.length ?? 0), 0);
  const volume = Number(workout.totalVolume) || workoutVolume(workout);
  const meta = [
    `${exercises.length} mashq`,
    `${sets} set`,
    volume > 0 ? `${formatCompact(volume)} kg` : null,
    formatDuration(workout.durationSec) || null,
  ].filter(Boolean);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-1.5 text-[13px] text-brand-text">
          <History size={14} /> Oxirgi mashg'ulot
        </div>
        <Link
          to="/tarix"
          className="flex items-center gap-0.5 text-[11px] text-brand-muted no-underline hover:text-brand-text"
        >
          Barcha tarix <ChevronRight size={13} />
        </Link>
      </div>

      <Link to="/tarix" className="block no-underline bg-brand-surface rounded-md p-3 hover:bg-brand-surface2 transition-colors">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[13px] font-semibold text-brand-text">{dateLabel(workout.date)}</span>
          <TypeBadge label={workout.target} />
        </div>
        <div className="text-[11px] text-brand-muted mb-1">{meta.join(" · ")}</div>
        <div className="text-xs text-brand-muted truncate">
          {exercises.map((e) => e.name).join(", ") || "Mashq kiritilmagan"}
        </div>
      </Link>
    </div>
  );
}
