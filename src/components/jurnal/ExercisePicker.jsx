import React, { useMemo, useState } from "react";
import { Check, ChevronRight, Plus, Search, Timer, X } from "lucide-react";
import { Input } from "../../ui/input.jsx";
import { Modal } from "../../ui/dialog.jsx";
import { Button } from "../../ui/button.jsx";
import { cn } from "../../utils/cn.js";
import { exerciseKey, searchExercises } from "../../utils/catalog.js";
import { MUSCLE_GROUPS, muscleGroupLabel } from "../../constants/muscleGroups.js";
import NewExerciseSheet from "./NewExerciseSheet.jsx";

function UnitIcon({ unit }) {
  return unit === "seconds" ? <Timer size={11} /> : <Plus size={11} />;
}

function ResultRow({ item, added, onPick }) {
  return (
    <button
      type="button"
      disabled={added}
      onClick={() => onPick(item)}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-left border-b border-brand-line last:border-b-0",
        added ? "opacity-50 cursor-default" : "cursor-pointer hover:bg-brand-surface",
      )}
    >
      <span className="text-brand-muted">
        <UnitIcon unit={item.unit} />
      </span>
      <span className="flex-1 min-w-0 text-[13px] text-brand-text truncate">{item.name}</span>
      <span className="text-[10px] text-brand-muted shrink-0">
        {added ? "qo'shilgan" : muscleGroupLabel(item.muscleGroup)}
      </span>
    </button>
  );
}

function AllExercisesSheet({ catalog, addedKeys, onPick, onCreate, onClose }) {
  const [query, setQuery] = useState("");
  const visible = query ? searchExercises(catalog, query, catalog.length) : catalog;

  const groups = MUSCLE_GROUPS.map((g) => ({
    ...g,
    items: visible
      .filter((e) => (e.muscleGroup || "other") === g.key)
      .sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((g) => g.items.length > 0);

  return (
    <Modal
      open
      title={`Barcha mashqlar · ${catalog.length}`}
      onClose={onClose}
      footer={
        <Button variant="secondary" onClick={onClose} className="w-full">
          Tayyor
        </Button>
      }
    >
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Qidirish..."
        className="mb-3"
      />
      {groups.length === 0 && (
        <div className="text-center py-4">
          <div className="text-[12px] text-brand-muted mb-2">Hech narsa topilmadi</div>
          {query.trim() && (
            <Button variant="secondary" size="sm" onClick={() => onCreate(query.trim())}>
              <Plus size={13} /> «{query.trim()}» yaratish
            </Button>
          )}
        </div>
      )}
      {groups.map((g) => (
        <div key={g.key} className="mb-3">
          <div className="text-[10px] uppercase tracking-wide text-brand-muted mb-1">{g.label}</div>
          <div className="flex flex-wrap gap-1.5">
            {g.items.map((e) => {
              const added = addedKeys.has(exerciseKey(e.name));
              return (
                <button
                  key={e.id ?? e.name}
                  type="button"
                  disabled={added}
                  onClick={() => onPick(e)}
                  className={cn(
                    "flex items-center gap-1 text-xs rounded-full px-2.5 py-1 border",
                    added
                      ? "border-brand-accent/50 text-brand-accent bg-brand-accent/10 cursor-default"
                      : "border-brand-line text-brand-text bg-brand-surface2 cursor-pointer hover:border-brand-accent",
                  )}
                >
                  {added ? <Check size={11} /> : <UnitIcon unit={e.unit} />}
                  {e.name}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </Modal>
  );
}

export default function ExercisePicker({ catalog, recent, alreadyAdded, onAdd, onCreate }) {
  const [query, setQuery] = useState("");
  const [allOpen, setAllOpen] = useState(false);
  const [createName, setCreateName] = useState(null);

  const addedKeys = useMemo(() => new Set(alreadyAdded.map(exerciseKey)), [alreadyAdded]);
  const results = useMemo(() => searchExercises(catalog, query, 6), [catalog, query]);
  const exact = results.some((e) => exerciseKey(e.name) === exerciseKey(query));
  const recentVisible = recent.filter((e) => !addedKeys.has(exerciseKey(e.name)));

  function pick(item) {
    onAdd(item);
    setQuery("");
  }

  function openCreate(name) {
    setAllOpen(false);
    setCreateName(name ?? "");
  }

  function onEnter() {
    const q = query.trim();
    if (!q) return;
    const target =
      results.find((e) => exerciseKey(e.name) === exerciseKey(q)) ??
      results.find((e) => !addedKeys.has(exerciseKey(e.name)));
    if (target && !addedKeys.has(exerciseKey(target.name))) pick(target);
    else if (!exact) openCreate(q);
  }

  return (
    <div className="mt-2">
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onEnter()}
          placeholder="Mashq qidirish yoki qo'shish..."
          className="pl-9 pr-9 text-[13px]"
          enterKeyHint="done"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Tozalash"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none text-brand-muted cursor-pointer p-1"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {query.trim() ? (
        <div className="mt-1.5 bg-brand-surface2 border border-brand-line rounded-md overflow-hidden">
          {results.map((e) => (
            <ResultRow
              key={e.id ?? e.name}
              item={e}
              added={addedKeys.has(exerciseKey(e.name))}
              onPick={pick}
            />
          ))}
          {!exact && (
            <button
              type="button"
              onClick={() => openCreate(query.trim())}
              className="w-full flex items-center gap-2 px-3 py-2 text-left cursor-pointer hover:bg-brand-surface"
            >
              <Plus size={13} className="text-brand-accent" />
              <span className="text-[13px] text-brand-text">
                «{query.trim()}» — <span className="text-brand-accent">yangi mashq</span>
              </span>
            </button>
          )}
        </div>
      ) : (
        <>
          {recentVisible.length > 0 && (
            <>
              <div className="text-[10px] uppercase tracking-wide text-brand-muted mt-2.5 mb-1.5">
                So'nggi
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentVisible.map((e) => (
                  <button
                    key={exerciseKey(e.name)}
                    type="button"
                    onClick={() => pick(e)}
                    className="text-xs bg-brand-surface2 border border-brand-line rounded-full px-2.5 py-1 text-brand-text cursor-pointer flex items-center gap-1 hover:border-brand-accent"
                  >
                    <UnitIcon unit={e.unit} />
                    {e.name}
                  </button>
                ))}
              </div>
            </>
          )}
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => setAllOpen(true)}
              disabled={catalog.length === 0}
              className="flex-1 flex items-center justify-between text-[12px] text-brand-muted bg-transparent border border-dashed border-brand-line rounded-md px-3 py-2 cursor-pointer hover:text-brand-text disabled:opacity-40 disabled:cursor-default"
            >
              Barcha mashqlar · {catalog.length}
              <ChevronRight size={14} />
            </button>
            <button
              type="button"
              onClick={() => openCreate("")}
              className="flex items-center gap-1 text-[12px] text-brand-muted bg-transparent border border-dashed border-brand-line rounded-md px-3 py-2 cursor-pointer hover:text-brand-text"
            >
              <Plus size={13} /> Yangi
            </button>
          </div>
        </>
      )}

      {allOpen && (
        <AllExercisesSheet
          catalog={catalog}
          addedKeys={addedKeys}
          onPick={onAdd}
          onCreate={openCreate}
          onClose={() => setAllOpen(false)}
        />
      )}

      {createName !== null && (
        <NewExerciseSheet
          initialName={createName}
          onClose={() => setCreateName(null)}
          onCreate={(data) => {
            onCreate(data);
            setCreateName(null);
            setQuery("");
          }}
        />
      )}
    </div>
  );
}
