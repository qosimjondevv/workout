import React, { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import TypeBadge from "../shared/TypeBadge.jsx";
import { ConfirmDialog } from "../../ui/dialog.jsx";
import { fmt, formatDuration } from "../../utils/date.js";
import { formatSet } from "../../utils/workout.js";
import { toNum } from "../../utils/num.js";

export default function HistoryItem({ workout, onEdit, onDelete }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const bodyWeight = toNum(workout.bodyWeight);
  const exercises = workout.exercises ?? [];
  const duration = formatDuration(workout.durationSec);

  return (
    <div className="bg-brand-surface rounded-md p-3 mb-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <TypeBadge label={workout.target} />
          <span className="text-[13px] font-semibold text-brand-text">
            {fmt(workout.date)}
          </span>
          {/* `bodyWeight && ...` 0 bo'lganda ekranga "0" chiqarib qo'yardi */}
          {bodyWeight !== null && bodyWeight > 0 && (
            <span className="text-[11px] text-brand-muted">
              {bodyWeight} kg
            </span>
          )}
          {duration && (
            <span className="text-[11px] text-brand-muted">{duration}</span>
          )}
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={onEdit}
            title="Tahrirlash"
            aria-label="Tahrirlash"
            className="bg-transparent border-none text-brand-muted cursor-pointer"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            title="O'chirish"
            aria-label="O'chirish"
            className="bg-transparent border-none text-brand-accent2 cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {exercises.length > 0 && (
        <div className="mt-2 flex flex-col gap-1">
          {exercises.map((e, i) => (
            <div key={e.id ?? i} className="text-xs text-brand-muted">
              <span className="text-brand-text">{e.name}</span>:{" "}
              {(e.sets ?? []).map((s) => formatSet(e.unit, s)).join(", ")}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Mashg'ulotni o'chirish"
        message={`${fmt(workout.date)} sanasidagi mashqlarni o'chiraymi? Bu amalni orqaga qaytarib bo'lmaydi.`}
        confirmLabel="O'chirish"
        cancelLabel="Bekor qilish"
        onConfirm={() => {
          onDelete();
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
