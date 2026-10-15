import React from "react";
import { X, Plus, Timer } from "lucide-react";
import { Input } from "../../ui/input.jsx";
import { Button } from "../../ui/button.jsx";
import { Select } from "../../ui/select.jsx";
import { cn } from "../../utils/cn.js";
import { MUSCLE_GROUPS, muscleGroupLabel } from "../../constants/muscleGroups.js";

export default function ExerciseListEditor({ items, draft, onDraftChange, onAdd, onRemove }) {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {items.map((it) => (
          <span
            key={it.id}
            className="text-xs bg-brand-surface2 rounded-full pl-2.5 pr-1.5 py-1 flex items-center gap-1 text-brand-text"
          >
            {it.unit === "seconds" && <Timer size={11} className="text-brand-muted" />}
            {it.name}
            <span className="text-[10px] text-brand-muted">{muscleGroupLabel(it.muscleGroup)}</span>
            <button
              onClick={() => onRemove(it.id)}
              className="bg-transparent border-none text-brand-muted p-0 flex cursor-pointer"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      <div className="flex gap-1.5 mb-1.5">
        <button
          type="button"
          onClick={() => onDraftChange({ ...draft, unit: "reps" })}
          className={cn(
            "flex-1 py-1 rounded-md text-[11px] font-semibold cursor-pointer border",
            draft.unit === "reps"
              ? "border-brand-accent text-brand-accent bg-brand-accent/10"
              : "border-brand-line text-brand-muted bg-brand-surface2",
          )}
        >
          Vazn × Marta
        </button>
        <button
          type="button"
          onClick={() => onDraftChange({ ...draft, unit: "seconds" })}
          className={cn(
            "flex-1 py-1 rounded-md text-[11px] font-semibold cursor-pointer border",
            draft.unit === "seconds"
              ? "border-brand-accent text-brand-accent bg-brand-accent/10"
              : "border-brand-line text-brand-muted bg-brand-surface2",
          )}
        >
          Soniya
        </button>
      </div>

      <div className="flex gap-1.5">
        <Input
          value={draft.name}
          onChange={(e) => onDraftChange({ ...draft, name: e.target.value })}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
          placeholder="Yangi mashq..."
          className="h-8 text-xs"
        />
        <Select
          value={draft.muscleGroup}
          onChange={(e) => onDraftChange({ ...draft, muscleGroup: e.target.value })}
        >
          {MUSCLE_GROUPS.map((g) => (
            <option key={g.key} value={g.key}>
              {g.label}
            </option>
          ))}
        </Select>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={onAdd}
          className="w-9 shrink-0"
        >
          <Plus size={13} />
        </Button>
      </div>
    </div>
  );
}
