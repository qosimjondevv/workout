import React, { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  Minus,
  Pencil,
  Plus,
  Save,
  Timer,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { Modal, ConfirmDialog } from "../../ui/dialog.jsx";
import { Input } from "../../ui/input.jsx";
import { Button } from "../../ui/button.jsx";
import { cn } from "../../utils/cn.js";
import { muscleGroupLabel } from "../../constants/muscleGroups.js";
import { exerciseKey, findExerciseMeta, searchExercises } from "../../utils/catalog.js";
import { MAX_GOAL_SETS, normalizeGoalSets, normalizeUnit } from "../../utils/workout.js";
import NewExerciseSheet from "./NewExerciseSheet.jsx";

const DEFAULT_SETS = 3;

function toItem(e) {
  return {
    key: exerciseKey(e.name),
    name: String(e.name).trim(),
    unit: normalizeUnit(e.unit),
    muscleGroup: e.muscleGroup,
    sets: normalizeGoalSets(e.sets) ?? DEFAULT_SETS,
    reps: String(e.reps ?? ""),
  };
}

function editorFromTemplate(t) {
  return {
    id: t?.id ?? null,
    name: t?.name ?? "",
    target: t?.target ?? "",
    items: (t?.exercises ?? []).map(toItem),
  };
}

function Step({ number, title, hint, children }) {
  return (
    <section className="mb-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-5 h-5 shrink-0 rounded-full bg-brand-accent text-neutral-950 text-[11px] font-bold flex items-center justify-center">
          {number}
        </span>
        <h3 className="text-[13px] font-semibold text-brand-text m-0">{title}</h3>
      </div>
      {hint && <p className="text-[11px] text-brand-muted mb-2 mt-0 pl-7">{hint}</p>}
      {children}
    </section>
  );
}

function IconButton({ label, disabled, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="h-7 w-7 flex items-center justify-center rounded bg-transparent border-none text-brand-muted cursor-pointer hover:text-brand-text disabled:opacity-25 disabled:cursor-default"
    >
      {children}
    </button>
  );
}

function ItemRow({ item, index, count, onChange, onMove, onRemove }) {
  const isSeconds = item.unit === "seconds";
  return (
    <div className="bg-brand-surface2 rounded-md px-2.5 py-2 mb-1.5">
      <div className="flex items-center gap-2">
        <span className="w-5 text-[11px] font-bold text-brand-accent tabular-nums shrink-0">
          {index + 1}.
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-brand-text truncate flex items-center gap-1">
            {isSeconds && <Timer size={11} className="text-brand-muted shrink-0" />}
            {item.name}
          </div>
          <div className="text-[10px] text-brand-muted">{muscleGroupLabel(item.muscleGroup)}</div>
        </div>
        <IconButton label="Yuqoriga ko'chirish" disabled={index === 0} onClick={() => onMove(-1)}>
          <ArrowUp size={14} />
        </IconButton>
        <IconButton
          label="Pastga ko'chirish"
          disabled={index === count - 1}
          onClick={() => onMove(1)}
        >
          <ArrowDown size={14} />
        </IconButton>
        <IconButton label={`${item.name}ni olib tashlash`} onClick={onRemove}>
          <X size={14} />
        </IconButton>
      </div>

      <div className="flex items-center gap-3 mt-1.5 pl-7">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-brand-muted">Setlar:</span>
          <div className="flex items-center border border-brand-line rounded-md bg-brand-bg">
            <IconButton
              label="Setni kamaytirish"
              disabled={item.sets <= 1}
              onClick={() => onChange({ sets: Math.max(1, item.sets - 1) })}
            >
              <Minus size={12} />
            </IconButton>
            <span className="text-[13px] font-semibold text-brand-text tabular-nums w-5 text-center">
              {item.sets}
            </span>
            <IconButton
              label="Setni ko'paytirish"
              disabled={item.sets >= MAX_GOAL_SETS}
              onClick={() => onChange({ sets: Math.min(MAX_GOAL_SETS, item.sets + 1) })}
            >
              <Plus size={12} />
            </IconButton>
          </div>
        </div>

        <label className="flex items-center gap-1.5 min-w-0">
          <span className="text-[11px] text-brand-muted">{isSeconds ? "Vaqt:" : "Takror:"}</span>
          <Input
            value={item.reps}
            onChange={(e) => onChange({ reps: e.target.value })}
            placeholder={isSeconds ? "60s" : "8-10"}
            maxLength={15}
            className="h-7 w-[64px] text-[12px] text-center px-1 bg-brand-bg"
          />
          {!isSeconds && <span className="text-[11px] text-brand-muted">marta</span>}
        </label>
      </div>
    </div>
  );
}

function TemplateEditor({
  initial,
  catalog,
  currentExercises,
  onCreateExercise,
  onSave,
  onCancel,
}) {
  const [draft, setDraft] = useState(initial);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const [createName, setCreateName] = useState(null);

  const selectedKeys = new Set(draft.items.map((i) => i.key));
  const trimmed = query.trim();
  const visibleCatalog = trimmed ? searchExercises(catalog, trimmed, catalog.length) : catalog;
  const canCreate =
    trimmed &&
    !selectedKeys.has(exerciseKey(trimmed)) &&
    !catalog.some((c) => exerciseKey(c.name) === exerciseKey(trimmed));

  function patch(update) {
    setDraft((d) => ({ ...d, ...update }));
    setError("");
  }

  function toggle(entry) {
    const key = exerciseKey(entry.name);
    setDraft((d) => ({
      ...d,
      items: d.items.some((i) => i.key === key)
        ? d.items.filter((i) => i.key !== key)
        : [...d.items, toItem(entry)],
    }));
    setError("");
  }

  function addCreated(data) {
    onCreateExercise(data);
    const key = exerciseKey(data.name);
    setDraft((d) =>
      d.items.some((i) => i.key === key) ? d : { ...d, items: [...d.items, toItem(data)] },
    );
    setCreateName(null);
    setQuery("");
    setError("");
  }

  function changeItem(idx, update) {
    setDraft((d) => ({
      ...d,
      items: d.items.map((it, i) => (i === idx ? { ...it, ...update } : it)),
    }));
  }

  function moveItem(idx, dir) {
    setDraft((d) => {
      const to = idx + dir;
      if (to < 0 || to >= d.items.length) return d;
      const items = d.items.slice();
      [items[idx], items[to]] = [items[to], items[idx]];
      return { ...d, items };
    });
  }

  function fillFromCurrent() {
    const list = (currentExercises ?? []).filter((e) => String(e.name ?? "").trim());
    if (!list.length) {
      setError("Jurnalda hali mashq yo'q");
      return;
    }
    setDraft((d) => {
      const known = new Set(d.items.map((i) => i.key));
      const added = list
        .filter((e) => !known.has(exerciseKey(e.name)))
        .map((e) =>
          toItem({
            ...findExerciseMeta(e.name, catalog, [e]),
            sets: Math.max(1, e.sets?.length ?? 1),
            reps: e.goalReps ?? "",
          }),
        );
      return { ...d, items: [...d.items, ...added] };
    });
    setError("");
  }

  function save() {
    if (!draft.name.trim()) {
      setError("1-qadam: nomini yozing");
      return;
    }
    if (!draft.items.length) {
      setError("2-qadam: kamida bitta mashq tanlang");
      return;
    }
    onSave({
      id: draft.id,
      name: draft.name,
      target: draft.target,
      exercises: draft.items.map(({ name, unit, muscleGroup, sets, reps }) => ({
        name,
        unit,
        muscleGroup,
        sets,
        reps,
      })),
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center gap-1 text-[11px] text-brand-muted bg-transparent border-none cursor-pointer p-0 mb-3 hover:text-brand-text"
      >
        <ChevronLeft size={13} /> Ro'yxatga qaytish
      </button>

      <Step number={1} title="Nomi">
        <label className="block text-[11px] text-brand-muted mb-1">Nomi</label>
        <Input
          value={draft.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="Masalan: Push Day"
          maxLength={60}
          className="mb-2"
        />
        <label className="block text-[11px] text-brand-muted mb-1">
          Mashg'ulot turi <span className="opacity-70">(ixtiyoriy)</span>
        </label>
        <Input
          value={draft.target}
          onChange={(e) => patch({ target: e.target.value })}
          placeholder="Masalan: Ko'krak, Triceps"
          maxLength={100}
        />
      </Step>

      <Step
        number={2}
        title={`Mashqlarni tanlang${draft.items.length ? ` · ${draft.items.length} ta` : ""}`}
        hint="Ro'yxatdan bosib qo'shing yoki yangi mashq nomini yozing."
      >
        <div className="flex flex-wrap gap-2 mb-2">
          <Button variant="secondary" size="sm" onClick={() => setCreateName(trimmed)}>
            <Plus size={13} /> Yangi mashq
          </Button>
          <Button variant="secondary" size="sm" onClick={fillFromCurrent}>
            <Wand2 size={13} /> Jurnaldagi mashqlarni olish
          </Button>
        </div>

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && canCreate && setCreateName(trimmed)}
          placeholder="Qidirish yoki yangi mashq nomi..."
          className="h-9 text-[13px] mb-2"
        />

        {canCreate && (
          <button
            type="button"
            onClick={() => setCreateName(trimmed)}
            className="w-full flex items-center gap-2 px-3 py-2 mb-2 text-left rounded-md border border-dashed border-brand-accent/50 bg-brand-accent/5 cursor-pointer hover:bg-brand-accent/10"
          >
            <Plus size={14} className="text-brand-accent shrink-0" />
            <span className="text-[13px] text-brand-text truncate">
              «{trimmed}» — <span className="text-brand-accent">yangi mashq qo'shish</span>
            </span>
          </button>
        )}

        {catalog.length === 0 ? (
          <div className="text-[12px] text-brand-muted py-2">
            Katalog hali bo'sh — «Yangi mashq» tugmasi bilan birinchisini qo'shing.
          </div>
        ) : visibleCatalog.length === 0 ? (
          <div className="text-[12px] text-brand-muted py-1">Katalogda topilmadi.</div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {visibleCatalog.map((c) => {
              const active = selectedKeys.has(exerciseKey(c.name));
              return (
                <button
                  key={c.id ?? c.name}
                  type="button"
                  onClick={() => toggle(c)}
                  title={muscleGroupLabel(c.muscleGroup)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center gap-1 text-xs rounded-full px-2.5 py-1 cursor-pointer border",
                    active
                      ? "border-brand-accent text-brand-accent bg-brand-accent/10"
                      : "border-brand-line text-brand-muted bg-brand-surface2 hover:text-brand-text",
                  )}
                >
                  {active ? <Check size={11} /> : <Plus size={11} />}
                  {c.name}
                </button>
              );
            })}
          </div>
        )}
      </Step>

      {draft.items.length > 0 && (
        <Step
          number={3}
          title="Har bir mashq uchun reja"
          hint="Mashg'ulot boshlanganda har mashqqa shuncha bo'sh set tayyorlanadi. Tartibni ↑↓ bilan o'zgartiring."
        >
          {draft.items.map((item, idx) => (
            <ItemRow
              key={item.key}
              item={item}
              index={idx}
              count={draft.items.length}
              onChange={(update) => changeItem(idx, update)}
              onMove={(dir) => moveItem(idx, dir)}
              onRemove={() => toggle(item)}
            />
          ))}
        </Step>
      )}

      {error && <div className="text-brand-accent2 text-xs mb-2">{error}</div>}

      {createName !== null && (
        <NewExerciseSheet
          initialName={createName}
          onClose={() => setCreateName(null)}
          onCreate={addCreated}
        />
      )}

      <Button onClick={save} className="w-full font-display uppercase tracking-wide text-sm">
        <Save size={15} /> {draft.id ? "O'zgarishlarni saqlash" : "Saqlash"}
      </Button>
    </div>
  );
}

export default function TemplateManager({
  open,
  onClose,
  templates,
  catalog,
  currentExercises,
  onCreateExercise,
  onSave,
  onDelete,
}) {
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  function close() {
    setEditing(null);
    onClose();
  }

  const pending = templates.find((t) => t.id === confirmId);
  const title = editing
    ? editing.id
      ? "Kunlik mashqni tahrirlash"
      : "Tayyor kunlik mashq yaratish"
    : "Tayyor kunlik mashqlar";

  return (
    <Modal open={open} title={title} onClose={close}>
      {editing ? (
        <TemplateEditor
          key={editing.id ?? "new"}
          initial={editing}
          catalog={catalog}
          currentExercises={currentExercises}
          onCreateExercise={onCreateExercise}
          onCancel={() => setEditing(null)}
          onSave={(data) => {
            onSave(data);
            setEditing(null);
          }}
        />
      ) : (
        <>
          {templates.length === 0 && (
            <div className="text-[12px] text-brand-muted text-center py-3">
              Hali kunlik mashq yo'q. Birinchisini yarating.
            </div>
          )}
          {templates.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 bg-brand-surface2 rounded-md px-3 py-2 mb-1.5"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-brand-text truncate">{t.name}</div>
                <div className="text-[11px] text-brand-muted truncate">
                  {(t.exercises ?? [])
                    .map((e) => (e.sets ? `${e.name} ${e.sets}×${e.reps || "?"}` : e.name))
                    .join(", ") || "-"}
                </div>
              </div>
              <IconButton
                label={`${t.name}ni tahrirlash`}
                onClick={() => setEditing(editorFromTemplate(t))}
              >
                <Pencil size={14} />
              </IconButton>
              <button
                type="button"
                onClick={() => setConfirmId(t.id)}
                aria-label={`${t.name}ni o'chirish`}
                title="O'chirish"
                className="h-7 w-7 flex items-center justify-center bg-transparent border-none text-brand-accent2 cursor-pointer shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={() => setEditing(editorFromTemplate(null))}
            className="w-full mt-2"
          >
            <Plus size={15} /> Tayyor kunlik mashq yaratish
          </Button>
        </>
      )}

      <ConfirmDialog
        open={Boolean(pending)}
        title="Kunlik mashqni o'chirish"
        message={`"${pending?.name}" ni o'chiraymi?`}
        onConfirm={() => {
          onDelete(confirmId);
          setConfirmId(null);
        }}
        onCancel={() => setConfirmId(null)}
      />
    </Modal>
  );
}
