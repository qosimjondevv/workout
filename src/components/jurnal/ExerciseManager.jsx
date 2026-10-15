import React from "react";
import { Settings2, ChevronRight } from "lucide-react";
import ExerciseListEditor from "./ExerciseListEditor.jsx";
import { cn } from "../../utils/cn.js";

export default function ExerciseManager({
  open,
  onToggle,
  items,
  draft,
  onDraftChange,
  onAdd,
  onRemove,
}) {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center bg-brand-surface border-none rounded-md px-3.5 py-2.5 text-brand-text cursor-pointer"
      >
        <span className="flex items-center gap-1.5 text-[13px]">
          <Settings2 size={14} /> Mashqlar ro'yxatini boshqarish
        </span>
        <ChevronRight size={16} className={cn("transition-transform", open && "rotate-90")} />
      </button>

      {open && (
        <div className="bg-brand-surface rounded-md p-3 mt-1.5">
          <ExerciseListEditor
            items={items}
            draft={draft}
            onDraftChange={onDraftChange}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        </div>
      )}
    </div>
  );
}
