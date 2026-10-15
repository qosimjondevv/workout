import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "../../ui/dialog.jsx";
import { Input } from "../../ui/input.jsx";
import { Button } from "../../ui/button.jsx";
import { SegmentedControl } from "../../ui/segmented.jsx";
import { cn } from "../../utils/cn.js";
import { MUSCLE_GROUPS, DEFAULT_MUSCLE_GROUP } from "../../constants/muscleGroups.js";

const UNITS = [
  { value: "reps", label: "Vazn × Marta" },
  { value: "seconds", label: "Soniya (plank)" },
];

export default function NewExerciseSheet({ initialName = "", onCreate, onClose }) {
  const [name, setName] = useState(initialName);
  const [unit, setUnit] = useState("reps");
  const [muscleGroup, setMuscleGroup] = useState(DEFAULT_MUSCLE_GROUP);
  const [error, setError] = useState("");

  function submit() {
    const n = name.trim();
    if (!n) {
      setError("Mashq nomini yozing");
      return;
    }
    onCreate({ name: n, unit, muscleGroup });
  }

  return (
    <Modal
      open
      title="Yangi mashq"
      onClose={onClose}
      footer={
        <Button onClick={submit} className="w-full font-display uppercase tracking-wide text-sm">
          <Plus size={16} /> Qo'shish
        </Button>
      }
    >
      <label className="text-[11px] text-brand-muted">Nomi</label>
      <Input
        autoFocus
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError("");
        }}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Masalan: Gantel bilan jim"
        maxLength={80}
        className="mt-1 mb-3"
      />

      <label className="text-[11px] text-brand-muted">Natija qanday yoziladi</label>
      <SegmentedControl value={unit} onChange={setUnit} options={UNITS} className="mt-1 mb-3" />

      <label className="text-[11px] text-brand-muted">Mushak guruhi</label>
      <div className="grid grid-cols-3 gap-1.5 mt-1">
        {MUSCLE_GROUPS.map((g) => (
          <button
            key={g.key}
            type="button"
            onClick={() => setMuscleGroup(g.key)}
            className={cn(
              "py-1.5 rounded-md text-xs font-semibold cursor-pointer border transition-colors",
              muscleGroup === g.key
                ? "border-brand-accent text-brand-accent bg-brand-accent/10"
                : "border-brand-line text-brand-muted bg-brand-surface2 hover:text-brand-text",
            )}
          >
            {g.label}
          </button>
        ))}
      </div>

      {error && <div className="text-brand-accent2 text-xs mt-3">{error}</div>}
    </Modal>
  );
}
