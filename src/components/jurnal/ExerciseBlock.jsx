import React, { useEffect, useRef, useState } from "react";
import {
  Link2,
  Link2Off,
  MessageSquare,
  MoreVertical,
  Plus,
  Timer,
  Trash2,
} from "lucide-react";
import SetRow from "./SetRow.jsx";
import TimerModal from "./TimerModal.jsx";
import ExerciseInsight from "./ExerciseInsight.jsx";
import RestPresetSheet from "./RestPresetSheet.jsx";
import { Textarea } from "../../ui/textarea.jsx";
import { cn } from "../../utils/cn.js";
import { fillSetFrom, isFilledSet, previousSetAt } from "../../utils/workout.js";

function MenuItem({ icon: Icon, children, danger, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-brand-surface2 cursor-pointer text-left",
        danger ? "text-brand-accent2" : "text-brand-text",
      )}
    >
      <Icon size={13} /> {children}
    </button>
  );
}

export default function ExerciseBlock({
  exercise,
  insight,
  superset,
  canLinkNext,
  recordFlags,
  restDefaultSeconds,
  onRemoveExercise,
  onUpdateExercise,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onToggleDone,
  onUsePrevious,
  onApplySuggestion,
  onStartRest,
  onLinkNext,
  onUnlink,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [timerSetIdx, setTimerSetIdx] = useState(null);
  const [restOpen, setRestOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(Boolean(exercise.note));
  const menuRef = useRef(null);
  const unit = exercise.unit || "reps";
  const prevSets = insight?.previous?.exercise?.sets ?? [];

  // Tashqariga bosish listener'i faqat menyu ochiq turganda osilib turadi.
  useEffect(() => {
    if (!menuOpen) return undefined;
    function onOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("touchstart", onOutside);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("touchstart", onOutside);
    };
  }, [menuOpen]);

  function closeMenuThen(fn) {
    return () => {
      setMenuOpen(false);
      fn();
    };
  }

  const goal =
    exercise.goalSets || exercise.goalReps
      ? `${exercise.goalSets ?? "?"} × ${exercise.goalReps || "?"}`
      : null;

  return (
    <div
      className={cn(
        "bg-brand-surface2 rounded-md p-2.5",
        superset && "border-l-2 border-brand-accent rounded-l-sm",
        superset && !superset.isLast ? "mb-0.5" : "mb-2",
      )}
    >
      <div className="flex justify-between items-start mb-1.5 gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            {superset && (
              <span
                className="text-[10px] font-bold text-neutral-950 bg-brand-accent rounded px-1 leading-4 shrink-0"
                title="Superset"
              >
                {superset.label}
              </span>
            )}
            <span className="font-semibold text-sm text-brand-text truncate">{exercise.name}</span>
          </div>
          {goal && (
            <div className="text-[10px] text-brand-muted mt-0.5">
              Reja: <span className="text-brand-text">{goal}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-0.5 -mt-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setRestOpen(true)}
            title="Dam olish taymeri"
            aria-label="Dam olish taymeri"
            className="bg-transparent border-none text-brand-muted cursor-pointer p-1"
          >
            <Timer size={15} />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Mashq menyusi"
              aria-expanded={menuOpen}
              className="bg-transparent border-none text-brand-muted cursor-pointer p-1"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-brand-surface border border-brand-line rounded-md shadow-lg overflow-hidden z-10 min-w-[190px]">
                <MenuItem icon={Plus} onClick={closeMenuThen(() => onAddSet())}>
                  Set qo'shish
                </MenuItem>
                <MenuItem icon={MessageSquare} onClick={closeMenuThen(() => setNoteOpen((o) => !o))}>
                  {noteOpen ? "Izohni yashirish" : "Izoh qo'shish"}
                </MenuItem>
                {/* Guruhga faqat OXIRGI a'zodan keyingisini qo'shish mumkin —
                    aks holda guruh o'rtasidan "yorilib" ketardi. */}
                {canLinkNext && (!superset || superset.isLast) && (
                  <MenuItem icon={Link2} onClick={closeMenuThen(onLinkNext)}>
                    {superset ? "Keyingisini ham qo'shish" : "Keyingisi bilan superset"}
                  </MenuItem>
                )}
                {superset && (
                  <MenuItem icon={Link2Off} onClick={closeMenuThen(onUnlink)}>
                    Supersetdan chiqarish
                  </MenuItem>
                )}
                <MenuItem icon={Trash2} danger onClick={closeMenuThen(onRemoveExercise)}>
                  Mashqni o'chirish
                </MenuItem>
              </div>
            )}
          </div>
        </div>
      </div>

      <ExerciseInsight
        insight={insight}
        unit={unit}
        onUsePrevious={onUsePrevious}
        onApplySuggestion={onApplySuggestion}
      />

      {noteOpen && (
        <Textarea
          rows={1}
          value={exercise.note ?? ""}
          onChange={(e) => onUpdateExercise("note", e.target.value)}
          placeholder="Masalan: texnikaga e'tibor berish"
          className="mb-2 text-[12px] bg-brand-bg"
        />
      )}

      {exercise.sets.map((set, setIdx) => {
        const fallback = previousSetAt(prevSets, setIdx);
        return (
          <SetRow
            key={set.id ?? setIdx}
            index={setIdx}
            unit={unit}
            set={set}
            placeholder={fallback}
            goalReps={exercise.goalReps}
            isRecord={Boolean(recordFlags?.[setIdx])}
            canComplete={isFilledSet(unit, fillSetFrom(unit, set, fallback))}
            onChange={(field, value) => onUpdateSet(setIdx, field, value)}
            onToggleDone={() => onToggleDone(setIdx)}
            onRemove={() => onRemoveSet(setIdx)}
            onStartTimer={() => setTimerSetIdx(setIdx)}
          />
        );
      })}

      <button
        type="button"
        onClick={() => onAddSet()}
        className="w-full flex items-center justify-center gap-1 mt-1 py-1.5 text-[11px] text-brand-muted bg-transparent border border-dashed border-brand-line rounded-md cursor-pointer hover:text-brand-text"
      >
        <Plus size={12} /> Set
      </button>

      {timerSetIdx !== null && (
        <TimerModal
          onCancel={() => setTimerSetIdx(null)}
          onComplete={(seconds) => {
            const idx = timerSetIdx;
            setTimerSetIdx(null);
            onUpdateSet(idx, "seconds", String(seconds));
          }}
        />
      )}

      <RestPresetSheet
        open={restOpen}
        defaultSeconds={restDefaultSeconds}
        onPick={(seconds) => {
          setRestOpen(false);
          onStartRest(seconds);
        }}
        onClose={() => setRestOpen(false)}
      />
    </div>
  );
}
