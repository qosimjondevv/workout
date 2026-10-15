import { uid } from "./id.js";
import { toNum, toStr } from "./num.js";
import { normalizeMuscleGroup } from "../constants/muscleGroups.js";

export function normalizeUnit(unit) {
  return unit === "seconds" ? "seconds" : "reps";
}

export function blankSet(unit, seconds) {
  if (normalizeUnit(unit) === "seconds") {
    return {
      id: uid(),
      seconds: seconds != null ? String(seconds) : "",
      done: false,
    };
  }
  return { id: uid(), weight: "", reps: "", done: false };
}

export function isFilledSet(unit, set) {
  if (!set) return false;
  if (normalizeUnit(unit) === "seconds") return toNum(set.seconds) !== null;
  return toNum(set.weight) !== null || toNum(set.reps) !== null;
}

export const MAX_GOAL_SETS = 20;

export function normalizeGoalSets(value) {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n >= 1 && n <= MAX_GOAL_SETS ? n : null;
}

export function makeExercise(name, unit, seconds, muscleGroup, goal) {
  const u = normalizeUnit(unit);
  return {
    id: uid(),
    name: String(name ?? "").trim(),
    unit: u,
    muscleGroup: normalizeMuscleGroup(muscleGroup),
    note: "",
    supersetId: null,
    goalSets: normalizeGoalSets(goal?.sets),
    goalReps: String(goal?.reps ?? "").trim(),
    sets: [blankSet(u, seconds)],
  };
}

export function emptyWorkoutForm(dateISO) {
  return {
    id: null,
    date: dateISO,
    target: "",
    bodyWeight: "",
    bodyWeightTouched: false,
    notes: "",
    startedAt: null,
    durationSec: null,
    exercises: [],
  };
}

export function toFormWorkout(stored) {
  const exercises = Array.isArray(stored?.exercises) ? stored.exercises : [];
  return {
    id: stored?.id ?? null,
    date: stored?.date ?? "",
    target: stored?.target ?? "",
    bodyWeight: toStr(stored?.bodyWeight),
    bodyWeightTouched: true,
    notes: stored?.notes ?? "",
    startedAt: null,
    durationSec: positiveInt(stored?.durationSec),
    exercises: normalizeSupersets(
      exercises.map((e) => {
        const unit = normalizeUnit(e?.unit);
        const sets = Array.isArray(e?.sets) ? e.sets : [];
        return {
          id: e?.id || uid(),
          name: String(e?.name ?? ""),
          unit,
          muscleGroup: normalizeMuscleGroup(e?.muscleGroup),
          note: e?.note ?? "",
          supersetId: e?.supersetId || null,
          goalSets: null,
          goalReps: "",
          sets: sets.map((s) =>
            unit === "seconds"
              ? { id: s?.id || uid(), seconds: toStr(s?.seconds), done: true }
              : {
                  id: s?.id || uid(),
                  weight: toStr(s?.weight),
                  reps: toStr(s?.reps),
                  done: true,
                },
          ),
        };
      }),
    ),
  };
}

function positiveInt(value) {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function toStoredWorkout(form) {
  const exercises = (form.exercises ?? [])
    .map((e) => {
      const unit = normalizeUnit(e.unit);
      const sets = (e.sets ?? [])
        .filter((s) => isFilledSet(unit, s))
        .map((s) =>
          unit === "seconds"
            ? { id: s.id || uid(), seconds: toNum(s.seconds) }
            : {
                id: s.id || uid(),
                weight: toNum(s.weight),
                reps: toNum(s.reps),
              },
        );
      return {
        id: e.id || uid(),
        name: String(e.name ?? "").trim(),
        unit,
        muscleGroup: normalizeMuscleGroup(e.muscleGroup),
        note: e.note ?? "",
        supersetId: e.supersetId || null,
        sets,
      };
    })
    .filter((e) => e.sets.length > 0 && e.name !== "");

  return {
    id: form.id || uid(),
    date: form.date,
    target: String(form.target ?? "").trim(),
    bodyWeight: toNum(form.bodyWeight),
    notes: String(form.notes ?? "").trim(),
    durationSec: positiveInt(form.durationSec),
    exercises: normalizeSupersets(exercises),
  };
}

export function workoutHasContent(form) {
  return (form.exercises ?? []).some((e) => (e.sets ?? []).some((s) => isFilledSet(e.unit, s)));
}

export function isFormDirty(form) {
  if (!form) return false;
  return (
    (form.exercises ?? []).length > 0 ||
    String(form.target ?? "").trim() !== "" ||
    String(form.notes ?? "").trim() !== "" ||
    (Boolean(form.bodyWeightTouched) && String(form.bodyWeight ?? "") !== "") ||
    isClockRunning(form) ||
    (!form.id && Boolean(positiveInt(form.durationSec)))
  );
}

export function formatSet(unit, set) {
  if (normalizeUnit(unit) === "seconds") return `${toNum(set?.seconds) ?? 0}s`;
  const w = toNum(set?.weight);
  const r = toNum(set?.reps);
  if (w !== null && r !== null) return `${w}kg×${r}`;
  if (w !== null) return `${w}kg`;
  if (r !== null) return `${r} marta`;
  return "-";
}

export function toFormSets(unit, sets) {
  const u = normalizeUnit(unit);
  return (sets ?? []).map((s) =>
    u === "seconds"
      ? { id: uid(), seconds: toStr(s?.seconds), done: false }
      : { id: uid(), weight: toStr(s?.weight), reps: toStr(s?.reps), done: false },
  );
}

export function previousSetAt(prevSets, idx) {
  if (!prevSets?.length) return null;
  return prevSets[idx] ?? prevSets[prevSets.length - 1];
}

export function fillSetFrom(unit, set, fallback) {
  if (!fallback) return set;
  if (normalizeUnit(unit) === "seconds") {
    return toNum(set.seconds) === null && toNum(fallback.seconds) !== null
      ? { ...set, seconds: toStr(fallback.seconds) }
      : set;
  }
  const next = { ...set };
  if (toNum(set.weight) === null && toNum(fallback.weight) !== null)
    next.weight = toStr(fallback.weight);
  if (toNum(set.reps) === null && toNum(fallback.reps) !== null) next.reps = toStr(fallback.reps);
  return next;
}

export function normalizeSupersets(exercises) {
  const list = exercises ?? [];
  const out = list.slice();
  const usedIds = new Set();
  let i = 0;
  while (i < list.length) {
    const id = list[i]?.supersetId || null;
    let j = i + 1;
    if (id) while (j < list.length && list[j]?.supersetId === id) j += 1;
    const size = j - i;

    if (id && size < 2) {
      out[i] = { ...list[i], supersetId: null };
    } else if (id && usedIds.has(id)) {
      const fresh = uid();
      for (let k = i; k < j; k += 1) out[k] = { ...list[k], supersetId: fresh };
      usedIds.add(fresh);
    } else if (id) {
      usedIds.add(id);
    }
    i = j;
  }
  return out;
}

export function supersetInfo(exercises) {
  const list = exercises ?? [];
  const info = new Array(list.length).fill(null);
  let group = 0;
  let i = 0;
  while (i < list.length) {
    const id = list[i]?.supersetId || null;
    let j = i + 1;
    if (id) while (j < list.length && list[j]?.supersetId === id) j += 1;
    const size = j - i;
    if (id && size >= 2) {
      const letter = String.fromCharCode(65 + (group % 26));
      for (let k = i; k < j; k += 1) {
        info[k] = { label: `${letter}${k - i + 1}`, isLast: k === j - 1 };
      }
      group += 1;
    }
    i = j;
  }
  return info;
}

export function linkWithNext(exercises, idx) {
  const list = exercises ?? [];
  if (idx < 0 || idx >= list.length - 1) return list;
  const id = list[idx].supersetId || list[idx + 1].supersetId || uid();
  const nextId = list[idx + 1].supersetId;
  const out = list.map((e, i) => {
    if (i === idx || i === idx + 1) return { ...e, supersetId: id };
    if (nextId && i > idx + 1 && e.supersetId === nextId) return { ...e, supersetId: id };
    return e;
  });
  return normalizeSupersets(out);
}

export function unlinkSuperset(exercises, idx) {
  const list = exercises ?? [];
  if (!list[idx]?.supersetId) return list;
  return normalizeSupersets(list.map((e, i) => (i === idx ? { ...e, supersetId: null } : e)));
}

export const MAX_WORKOUT_SECONDS = 5 * 60 * 60;

export function isClockRunning(form) {
  return Boolean(form?.startedAt) && Number.isFinite(Number(form.startedAt));
}

export function elapsedWorkoutSec(form, now) {
  const base = positiveInt(form?.durationSec) ?? 0;
  if (!isClockRunning(form)) return base;
  return base + Math.max(0, Math.floor((now - Number(form.startedAt)) / 1000));
}

export function startWorkoutClock(form, now) {
  return isClockRunning(form) ? form : { ...form, startedAt: now };
}

export function stopWorkoutClock(form, now) {
  if (!isClockRunning(form)) return form;
  return { ...form, startedAt: null, durationSec: elapsedWorkoutSec(form, now) || null };
}

export function finalWorkoutDuration(form, now) {
  const sec = elapsedWorkoutSec(form, now);
  return sec > 0 && sec <= MAX_WORKOUT_SECONDS ? sec : null;
}

const DRAFT_VERSION = 1;

export function serializeDraft(form) {
  return JSON.stringify({ v: DRAFT_VERSION, form });
}

export function parseDraft(text) {
  if (!text) return null;
  try {
    const data = JSON.parse(text);
    if (!data || data.v !== DRAFT_VERSION) return null;
    return sanitizeFormWorkout(data.form);
  } catch {
    return null;
  }
}

function text(value) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

export function sanitizeFormWorkout(raw) {
  if (!raw || typeof raw !== "object") return null;
  const exercises = (Array.isArray(raw.exercises) ? raw.exercises : [])
    .filter((e) => e && text(e.name).trim())
    .map((e) => {
      const unit = normalizeUnit(e.unit);
      const sets = (Array.isArray(e.sets) ? e.sets : [])
        .filter((s) => s && typeof s === "object")
        .map((s) =>
          unit === "seconds"
            ? { id: text(s.id) || uid(), seconds: text(s.seconds), done: s.done === true }
            : {
                id: text(s.id) || uid(),
                weight: text(s.weight),
                reps: text(s.reps),
                done: s.done === true,
              },
        );
      return {
        id: text(e.id) || uid(),
        name: text(e.name),
        unit,
        muscleGroup: normalizeMuscleGroup(e.muscleGroup),
        note: text(e.note),
        supersetId: typeof e.supersetId === "string" && e.supersetId ? e.supersetId : null,
        goalSets: normalizeGoalSets(e.goalSets),
        goalReps: text(e.goalReps),
        sets,
      };
    });

  const started = Number(raw.startedAt);
  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : null,
    date: /^\d{4}-\d{2}-\d{2}$/.test(text(raw.date)) ? raw.date : "",
    target: text(raw.target),
    bodyWeight: text(raw.bodyWeight),
    bodyWeightTouched: raw.bodyWeightTouched === true,
    notes: text(raw.notes),
    startedAt: raw.startedAt && Number.isFinite(started) && started > 0 ? started : null,
    durationSec: positiveInt(raw.durationSec),
    exercises: normalizeSupersets(exercises),
  };
}
