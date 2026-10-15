import React, { useState } from "react";
import { ChevronDown, History, RotateCcw, X } from "lucide-react";
import { Card, CardHeader, CardTitle } from "../../ui/card.jsx";
import { Input } from "../../ui/input.jsx";
import { Textarea } from "../../ui/textarea.jsx";
import { DateField } from "../../ui/date-field.jsx";
import { ConfirmDialog } from "../../ui/dialog.jsx";
import { cn } from "../../utils/cn.js";
import ExerciseBlock from "./ExerciseBlock.jsx";
import ExercisePicker from "./ExercisePicker.jsx";
import WorkoutClock from "./WorkoutClock.jsx";

const FIELD_LABEL =
  "flex items-center justify-between h-4 mb-1 text-[11px] leading-none text-brand-muted";

export default function WorkoutForm({
  wf,
  insights,
  supersets,
  recordFlags,
  catalog,
  recent,
  restDefaultSeconds,
  onToggleDone,
  onStartRest,
  onAddExercise,
  onCreateExercise,
}) {
  const { form } = wf;
  const hasExtras = Boolean(form.target.trim() || form.notes.trim());
  const [extrasOpen, setExtrasOpen] = useState(hasExtras);
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="truncate">
          {wf.isEditing ? "Yozuvni tahrirlash" : "Yangi mashg'ulot"}
        </CardTitle>
        {wf.isEditing ? (
          <button
            type="button"
            onClick={wf.resetForm}
            className="flex items-center gap-1 text-xs text-brand-muted bg-transparent border-none cursor-pointer shrink-0"
          >
            <X size={14} /> Bekor qilish
          </button>
        ) : (
          wf.isDirty && (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-1 text-xs text-brand-muted bg-transparent border-none cursor-pointer shrink-0"
            >
              <RotateCcw size={13} /> Tozalash
            </button>
          )
        )}
      </CardHeader>

      <WorkoutClock
        form={form}
        readOnly={wf.isEditing}
        onStart={wf.startClock}
        onStop={wf.stopClock}
      />

      {wf.restored && (
        <div className="flex items-center gap-2 bg-brand-accent/10 border border-brand-accent/40 rounded-md px-3 py-2 mb-3">
          <History size={14} className="text-brand-accent shrink-0" />
          <span className="text-[12px] text-brand-text flex-1">
            Tugallanmagan mashg'ulot tiklandi
          </span>
          <button
            type="button"
            onClick={wf.dismissRestored}
            aria-label="Yopish"
            className="bg-transparent border-none text-brand-muted cursor-pointer p-0.5"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex gap-2 mb-2.5">
        <div className="flex-1 min-w-0">
          <span className={FIELD_LABEL}>Sana</span>
          <DateField value={form.date} onChange={wf.onDateChange} />
        </div>
        <div className="w-[110px]">
          <label htmlFor="body-weight" className={FIELD_LABEL}>
            Vazn (kg)
            {wf.bodyWeightAuto && <span className="text-[10px] opacity-80">oxirgi</span>}
          </label>
          <Input
            id="body-weight"
            type="number"
            inputMode="decimal"
            placeholder="0.0"
            value={wf.bodyWeight}
            onChange={(e) => wf.setBodyWeight(e.target.value)}
            className={cn(wf.bodyWeightAuto && "text-brand-muted")}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setExtrasOpen((o) => !o)}
        aria-expanded={extrasOpen}
        className="w-full flex items-center gap-1.5 text-[11px] text-brand-muted bg-transparent border-none cursor-pointer p-0 mb-2.5"
      >
        <ChevronDown
          size={13}
          className={cn("transition-transform", !extrasOpen && "-rotate-90")}
        />
        Mashq turi va izoh
        {!extrasOpen && hasExtras && (
          <span className="text-brand-text truncate">
            · {[form.target.trim(), form.notes.trim() && "izoh bor"].filter(Boolean).join(" · ")}
          </span>
        )}
      </button>

      {extrasOpen && (
        <div className="mb-3 flex flex-col gap-2">
          <Input
            value={form.target}
            onChange={(e) => wf.setTarget(e.target.value)}
            placeholder="Mashq turi, masalan: Ko'krak, Triceps"
            maxLength={100}
          />
          <Textarea
            value={form.notes ?? ""}
            onChange={(e) => wf.setNotes(e.target.value)}
            placeholder="Izoh, masalan: yelka og'ridi, vaznni tushirdim"
            maxLength={1000}
          />
        </div>
      )}

      {form.exercises.map((ex, exIdx) => {
        const insight = insights?.[ex.name];
        return (
          <ExerciseBlock
            key={ex.id ?? exIdx}
            exercise={ex}
            insight={insight}
            superset={supersets[exIdx]}
            canLinkNext={exIdx < form.exercises.length - 1}
            recordFlags={recordFlags[exIdx]}
            restDefaultSeconds={restDefaultSeconds}
            onRemoveExercise={() => wf.removeExerciseFromForm(exIdx)}
            onUpdateExercise={(field, value) => wf.updateExercise(exIdx, field, value)}
            onUpdateSet={(setIdx, field, value) => wf.updateSet(exIdx, setIdx, field, value)}
            onAddSet={(seconds) => wf.addSet(exIdx, seconds)}
            onRemoveSet={(setIdx) => wf.removeSet(exIdx, setIdx)}
            onToggleDone={(setIdx) => onToggleDone(exIdx, setIdx)}
            onUsePrevious={() => wf.usePreviousSets(exIdx, insight?.previous?.exercise?.sets)}
            onApplySuggestion={() => wf.applySuggestion(exIdx, insight?.suggestion)}
            onStartRest={onStartRest}
            onLinkNext={() => wf.linkSuperset(exIdx)}
            onUnlink={() => wf.unlinkFromSuperset(exIdx)}
          />
        );
      })}

      <ExercisePicker
        catalog={catalog}
        recent={recent}
        alreadyAdded={form.exercises.map((e) => e.name)}
        onAdd={onAddExercise}
        onCreate={onCreateExercise}
      />

      <ConfirmDialog
        open={confirmClear}
        title="Formani tozalash"
        message="Kiritilgan mashqlar va setlar o'chiriladi. Davom etamizmi?"
        confirmLabel="Tozalash"
        onConfirm={() => {
          wf.resetForm();
          setConfirmClear(false);
        }}
        onCancel={() => setConfirmClear(false)}
      />
    </Card>
  );
}
