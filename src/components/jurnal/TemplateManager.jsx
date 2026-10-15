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
import {
  exerciseKey,
  findExerciseMeta,
  formatTemplateDays,
  normalizeTemplateDays,
  searchExercises,
} from "../../utils/catalog.js";
import { MAX_GOAL_SETS, normalizeGoalSets, normalizeUnit } from "../../utils/workout.js";
import { WEEKDAY_SHORT } from "../../utils/date.js";

const CATALOG_SEARCH_FROM = 12;

function toItem(e) {
  return {
    key: exerciseKey(e.name),
    name: String(e.name).trim(),
    unit: normalizeUnit(e.unit),
    muscleGroup: e.muscleGroup,
    sets: normalizeGoalSets(e.sets) ?? 3,
    reps: String(e.reps ?? ""),
  };
}

function editorFromTemplate(t) {
  return {
    id: t?.id ?? null,
    name: t?.name ?? "",
    target: t?.target ?? "",
    days: normalizeTemplateDays(t?.days),
    items: (t?.exercises ?? []).map(toItem),
  };
}

function ItemRow({ item, index, count, onChange, onMove, onRemove }) {
  const isSeconds = item.unit === "seconds";
  return (
    <div className="flex items-center gap-1.5 bg-brand-surface2 rounded-md px-2 py-1.5 mb-1">
      <div className="flex flex-col shrink-0">
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          aria-label="Yuqoriga"
          className="bg-transparent border-none text-brand-muted p-0 cursor-pointer disabled:opacity-25 disabled:cursor-default"
        >
          <ArrowUp size={13} />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={index === count - 1}
          aria-label="Pastga"
          className="bg-transparent border-none text-brand-muted p-0 cursor-pointer disabled:opacity-25 disabled:cursor-default"
        >
          <ArrowDown size={13} />
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-semibold text-brand-text truncate flex items-center gap-1">
          {isSeconds && <Timer size={11} className="text-brand-muted shrink-0" />}
          {item.name}
        </div>
        <div className="text-[10px] text-brand-muted">{muscleGroupLabel(item.muscleGroup)}</div>
      </div>

      <div className="flex items-center shrink-0 border border-brand-line rounded-md">
        <button
          type="button"
          onClick={() => onChange({ sets: Math.max(1, item.sets - 1) })}
          aria-label="Set kamaytirish"
          className="bg-transparent border-none text-brand-muted px-1.5 py-1 cursor-pointer"
        >
          <Minus size={11} />
        </button>
        <span className="text-[12px] text-brand-text tabular-nums w-9 text-center">
          {item.sets} set
        </span>
        <button
          type="button"
          onClick={() => onChange({ sets: Math.min(MAX_GOAL_SETS, item.sets + 1) })}
          aria-label="Set ko'paytirish"
          className="bg-transparent border-none text-brand-muted px-1.5 py-1 cursor-pointer"
        >
          <Plus size={11} />
        </button>
      </div>

      <Input
        value={item.reps}
        onChange={(e) => onChange({ reps: e.target.value })}
        placeholder={isSeconds ? "60s" : "8-10"}
        maxLength={15}
        aria-label={`${item.name}: maqsad`}
        className="h-8 w-[58px] shrink-0 text-[12px] text-center px-1"
      />

      <button
        type="button"
        onClick={onRemove}
        aria-label={`${item.name}ni olib tashlash`}
        className="bg-transparent border-none text-brand-muted cursor-pointer p-0.5 shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  );
}

function TemplateEditor({ initial, catalog, currentExercises, onSave, onCancel }) {
  const [draft, setDraft] = useState(initial);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  const selectedKeys = new Set(draft.items.map((i) => i.key));
  const visibleCatalog =
    catalog.length > CATALOG_SEARCH_FROM && query.trim()
      ? searchExercises(catalog, query, catalog.length)
      : catalog;

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

  function toggleDay(day) {
    setDraft((d) => ({
      ...d,
      days: d.days.includes(day)
        ? d.days.filter((x) => x !== day)
        : [...d.days, day].sort((a, b) => a - b),
    }));
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
      setError("Formada hali mashq yo'q");
      return;
    }
    setDraft((d) => {
      const known = new Set(d.items.map((i) => i.key));
      const added = list
        .filter((e) => !known.has(exerciseKey(e.name)))
        .map((e) => {
          const meta = findExerciseMeta(e.name, catalog, [e]);
          return toItem({
            ...meta,
            sets: Math.max(1, e.sets?.length ?? 1),
            reps: e.goalReps ?? "",
          });
        });
      return { ...d, items: [...d.items, ...added] };
    });
    setError("");
  }

  function save() {
    if (!draft.name.trim()) {
      setError("Nomini yozing");
      return;
    }
    if (!draft.items.length) {
      setError("Kamida bitta mashq tanlang");
      return;
    }
    onSave({
      id: draft.id,
      name: draft.name,
      target: draft.target,
      days: draft.days,
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
        className="flex items-center gap-1 text-[11px] text-brand-muted bg-transparent border-none cursor-pointer p-0 mb-3"
      >
        <ChevronLeft size={13} /> Kunlik mashqlar ro'yxati
      </button>

      <div className="flex gap-2 mb-2">
        <Input
          value={draft.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="Nomi: Push Day"
          maxLength={60}
          className="h-9 text-[13px]"
        />
        <Input
          value={draft.target}
          onChange={(e) => patch({ target: e.target.value })}
          placeholder="Ko'krak, Triceps"
          maxLength={100}
          className="h-9 text-[13px]"
        />
      </div>

      <div className="text-[10px] text-brand-muted mb-1 px-0.5">Qaysi kunlari</div>
      <div className="grid grid-cols-7 gap-1 mb-3" role="group" aria-label="Hafta kunlari">
        {WEEKDAY_SHORT.map((label, day) => {
          const active = draft.days.includes(day);
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggleDay(day)}
              aria-pressed={active}
              className={cn(
                "py-1.5 rounded-md text-[10px] font-bold tracking-wide cursor-pointer border transition-colors",
                active
                  ? "border-brand-accent text-neutral-950 bg-brand-accent"
                  : "border-brand-line text-brand-muted bg-brand-surface2 hover:text-brand-text",
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {draft.items.length > 0 && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-brand-muted mb-1 px-1">
            <span>Mashqlar tartibi · {draft.items.length}</span>
            <span>reja · maqsad</span>
          </div>
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
        </div>
      )}

      <button
        type="button"
        onClick={fillFromCurrent}
        className="flex items-center gap-1.5 text-[11px] text-brand-muted bg-transparent border-none cursor-pointer mb-2 p-0 hover:text-brand-text"
      >
        <Wand2 size={12} /> Joriy mashg'ulotdagi mashqlarni olish
      </button>

      {catalog.length > CATALOG_SEARCH_FROM && (
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Katalogdan qidirish..."
          className="h-8 text-xs mb-2"
        />
      )}

      {catalog.length === 0 ? (
        <div className="text-[12px] text-brand-muted py-3 text-center">
          Katalog bo'sh — mashqlar Jurnal'da qo'shilganda shu yerda chiqadi.
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5 mb-3">
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
                    : "border-brand-line text-brand-muted bg-brand-surface2",
                )}
              >
                {active ? <Check size={11} /> : c.unit === "seconds" && <Timer size={11} />}
                {c.name}
              </button>
            );
          })}
        </div>
      )}

      {error && <div className="text-brand-accent2 text-xs mb-2">{error}</div>}

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

  return (
    <Modal
      open={open}
      title={
        editing
          ? editing.id
            ? "Kunlik mashqni tahrirlash"
            : "Tayyor kunlik mashq yaratish"
          : "Tayyor kunlik mashqlar"
      }
      onClose={close}
    >
      {editing ? (
        <TemplateEditor
          key={editing.id ?? "new"}
          initial={editing}
          catalog={catalog}
          currentExercises={currentExercises}
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
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-[13px] font-semibold text-brand-text truncate">
                    {t.name}
                  </span>
                  {formatTemplateDays(t.days) && (
                    <span className="text-[9px] font-bold tracking-wide text-brand-accent shrink-0">
                      {formatTemplateDays(t.days)}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-brand-muted truncate">
                  {(t.exercises ?? [])
                    .map((e) => (e.sets ? `${e.name} ${e.sets}×${e.reps || "?"}` : e.name))
                    .join(", ") || "-"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditing(editorFromTemplate(t))}
                aria-label={`${t.name}ni tahrirlash`}
                className="bg-transparent border-none text-brand-muted cursor-pointer shrink-0 p-1"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => setConfirmId(t.id)}
                aria-label={`${t.name}ni o'chirish`}
                className="bg-transparent border-none text-brand-accent2 cursor-pointer shrink-0 p-1"
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
