import { uid } from "./id.js";
import { toNum } from "./num.js";
import { normalizeUnit } from "./workout.js";
import { normalizeMuscleGroup } from "../constants/muscleGroups.js";
import { MEASUREMENT_FIELDS } from "../constants/measurementFields.js";

export function makeExerciseDoc({ name, unit, muscleGroup }) {
  return {
    id: uid(),
    name: String(name ?? "").trim(),
    unit: normalizeUnit(unit),
    muscleGroup: normalizeMuscleGroup(muscleGroup),
  };
}

const APOSTROPHES = /[ʻʼ‘’`´]/g;

export function exerciseKey(name) {
  return String(name ?? "")
    .replace(APOSTROPHES, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export function findExerciseMeta(name, ...sources) {
  const key = exerciseKey(name);
  if (!key) return null;
  for (const list of sources) {
    const hit = (list ?? []).find((e) => exerciseKey(e?.name) === key);
    if (hit) {
      return {
        name: String(hit.name).trim(),
        unit: normalizeUnit(hit.unit),
        muscleGroup: normalizeMuscleGroup(hit.muscleGroup),
      };
    }
  }
  return null;
}

export function searchExercises(catalog, query, limit = 8) {
  const q = exerciseKey(query);
  if (!q) return [];
  const scored = [];
  (catalog ?? []).forEach((e) => {
    const key = exerciseKey(e?.name);
    const idx = key.indexOf(q);
    if (!key || idx === -1) return;
    const rank = key === q ? 0 : idx === 0 ? 1 : /[\s(-]/.test(key[idx - 1]) ? 2 : 3;
    scored.push({ e, rank });
  });
  return scored
    .sort((a, b) => a.rank - b.rank || a.e.name.localeCompare(b.e.name))
    .slice(0, limit)
    .map((s) => s.e);
}

export function recentExercises(workouts, catalog, limit = 6) {
  const seen = new Set();
  const out = [];
  const sorted = [...(workouts ?? [])].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  );
  for (const w of sorted) {
    for (const e of w.exercises ?? []) {
      const key = exerciseKey(e?.name);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(
        findExerciseMeta(e.name, catalog) ?? {
          name: String(e.name).trim(),
          unit: normalizeUnit(e.unit),
          muscleGroup: normalizeMuscleGroup(e.muscleGroup),
        },
      );
      if (out.length >= limit) return out;
    }
  }
  return out;
}

export const TEMPLATE_MAX_SETS = 20;
const GOAL_REPS_MAX_LEN = 15;

export function normalizeGoalSets(value) {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n >= 1 && n <= TEMPLATE_MAX_SETS ? n : null;
}

function normalizeGoalReps(value) {
  return String(value ?? "")
    .trim()
    .slice(0, GOAL_REPS_MAX_LEN);
}

export function normalizeTemplateDays(days) {
  if (!Array.isArray(days)) return [];
  const valid = days
    .filter((d) => typeof d === "number" || (typeof d === "string" && d.trim() !== ""))
    .map((d) => Number(d))
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
  return Array.from(new Set(valid)).sort((a, b) => a - b);
}

export function templatesForDay(templates, dayIndex) {
  return (templates ?? [])
    .filter((t) => normalizeTemplateDays(t.days).includes(dayIndex))
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

export function makeTemplate({ id, name, target, days, exercises }) {
  return {
    id: id || uid(),
    name: String(name ?? "").trim(),
    target: String(target ?? "").trim(),
    days: normalizeTemplateDays(days),
    exercises: (exercises ?? [])
      .filter((e) => String(e?.name ?? "").trim())
      .map((e) => ({
        name: String(e.name).trim(),
        unit: normalizeUnit(e.unit),
        muscleGroup: normalizeMuscleGroup(e.muscleGroup),
        sets: normalizeGoalSets(e.sets),
        reps: normalizeGoalReps(e.reps),
      })),
  };
}

export function toStoredMeasurement(entry) {
  const values = {};
  MEASUREMENT_FIELDS.forEach((f) => {
    const n = toNum(entry.values?.[f.key]);
    if (n !== null) values[f.key] = n;
  });
  return { id: entry.id || uid(), date: entry.date, values };
}
