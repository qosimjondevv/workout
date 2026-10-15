import React from "react";
import { Modal } from "../../ui/dialog.jsx";
import TypeBadge from "../shared/TypeBadge.jsx";
import { fmt, formatDuration } from "../../utils/date.js";
import { formatSet, supersetInfo } from "../../utils/workout.js";
import { formatCompact } from "../../utils/num.js";
import { muscleGroupLabel } from "../../constants/muscleGroups.js";
import { workoutVolume } from "../../utils/metrics.js";

export default function WorkoutDayModal({ date, workouts, onClose }) {
  return (
    <Modal open={Boolean(date)} title={date ? fmt(date) : ""} onClose={onClose}>
      {workouts.map((w) => {
        const volume = Number(w.totalVolume) || workoutVolume(w);
        const duration = formatDuration(w.durationSec);
        const groups = supersetInfo(w.exercises ?? []);
        return (
          <div key={w.id} className="mb-4 last:mb-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <TypeBadge label={w.target} />
              {Number(w.bodyWeight) > 0 && (
                <span className="text-[11px] text-brand-muted">{w.bodyWeight} kg</span>
              )}
              {volume > 0 && (
                <span className="text-[11px] text-brand-muted">
                  Hajm: {formatCompact(volume)} kg
                </span>
              )}
              {duration && <span className="text-[11px] text-brand-muted">{duration}</span>}
            </div>

            {(w.exercises ?? []).map((e, i) => (
              <div key={e.id ?? i} className="bg-brand-surface2 rounded-md px-3 py-2 mb-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[13px] font-semibold text-brand-text">
                    {groups[i] && (
                      <span className="text-[10px] font-bold text-neutral-950 bg-brand-accent rounded px-1 mr-1.5">
                        {groups[i].label}
                      </span>
                    )}
                    {e.name}
                  </span>
                  <span className="text-[10px] text-brand-muted shrink-0">
                    {muscleGroupLabel(e.muscleGroup)}
                  </span>
                </div>
                <div className="text-xs text-brand-muted mt-0.5">
                  {(e.sets ?? []).map((s) => formatSet(e.unit, s)).join(", ")}
                </div>
              </div>
            ))}

            {w.notes && <div className="text-[12px] text-brand-muted italic mt-2">{w.notes}</div>}
          </div>
        );
      })}
    </Modal>
  );
}
