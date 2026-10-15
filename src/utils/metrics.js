import { diffDays, isoWeekKey, monthKey, shortDate, todayISO } from "./date.js";
import { isFilledSet, normalizeUnit } from "./workout.js";
import { round, toNum } from "./num.js";

export function setVolume(set) {
  const w = Number(set?.weight);
  const r = Number(set?.reps);
  if (!Number.isFinite(w) || !Number.isFinite(r)) return 0;
  return w * r;
}

function exerciseVolume(exercise) {
  if (normalizeUnit(exercise?.unit) === "seconds") return 0;
  return (exercise?.sets ?? []).reduce((sum, s) => sum + setVolume(s), 0);
}

export function workoutVolume(workout) {
  return (workout?.exercises ?? []).reduce((sum, e) => sum + exerciseVolume(e), 0);
}

export function estimated1RM(weight, reps) {
  const w = Number(weight);
  const r = Number(reps);
  if (!Number.isFinite(w) || !Number.isFinite(r) || w <= 0 || r <= 0) return 0;
  if (r === 1) return w;
  return round(w * (1 + r / 30), 1);
}

function exerciseBest1RM(exercise) {
  if (normalizeUnit(exercise?.unit) === "seconds") return 0;
  return (exercise?.sets ?? []).reduce(
    (best, s) => Math.max(best, estimated1RM(s.weight, s.reps)),
    0,
  );
}

export function exerciseStats(exercise) {
  const unit = normalizeUnit(exercise?.unit);
  const sets = exercise?.sets ?? [];
  const nums = (key) => sets.map((s) => Number(s[key])).filter((n) => Number.isFinite(n));

  const weights = nums("weight");
  const reps = nums("reps");
  const seconds = nums("seconds");

  return {
    unit,
    bestWeight: weights.length ? Math.max(...weights) : 0,
    bestReps: reps.length ? Math.max(...reps) : 0,
    bestTime: seconds.length ? Math.max(...seconds) : 0,
    volume: exerciseVolume(exercise),
    best1RM: exerciseBest1RM(exercise),
  };
}

export function exerciseHistoryStats(workouts, exerciseName) {
  const entries = [];
  workouts.forEach((w) => {
    (w.exercises ?? []).forEach((e) => {
      if (e.name !== exerciseName) return;
      entries.push({ date: w.date, ...exerciseStats(e) });
    });
  });
  entries.sort((a, b) => (a.date > b.date ? 1 : -1));

  const max = (key) => (entries.length ? Math.max(...entries.map((e) => e[key])) : 0);

  return {
    entries,
    last: entries.length ? entries[entries.length - 1] : null,
    bestWeight: max("bestWeight"),
    bestReps: max("bestReps"),
    bestTime: max("bestTime"),
    bestVolume: max("volume"),
    best1RM: max("best1RM"),
  };
}

export function findPreviousExercise(workouts, exerciseName, beforeDate, excludeWorkoutId) {
  const candidates = workouts
    .filter((w) => w.id !== excludeWorkoutId)
    .filter((w) => !beforeDate || w.date <= beforeDate)
    .filter((w) => (w.exercises ?? []).some((e) => e.name === exerciseName))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  if (!candidates.length) return null;
  const workout = candidates[0];
  const exercise = workout.exercises.find((e) => e.name === exerciseName);
  return { date: workout.date, exercise };
}

export function suggestProgression(previousExercise, step = 2.5) {
  if (!previousExercise) return null;
  if (normalizeUnit(previousExercise.unit) === "seconds") {
    const best = exerciseStats(previousExercise).bestTime;
    if (!best) return null;
    return { unit: "seconds", seconds: best + 15 };
  }
  const sets = previousExercise.sets ?? [];
  if (!sets.length) return null;
  const top = sets.reduce(
    (best, s) => (Number(s.weight) > Number(best?.weight ?? -1) ? s : best),
    null,
  );
  const w = Number(top?.weight);
  const r = Number(top?.reps);
  if (!Number.isFinite(w) || !Number.isFinite(r)) return null;
  return { unit: "reps", weight: round(w + step, 1), reps: r };
}

export function computeStreaks(dates) {
  const unique = Array.from(new Set((dates ?? []).filter(Boolean))).sort();
  if (!unique.length) return { current: 0, longest: 0 };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < unique.length; i += 1) {
    run = diffDays(unique[i], unique[i - 1]) === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }

  const sinceLast = diffDays(todayISO(), unique[unique.length - 1]);
  let current = 0;
  if (sinceLast === 0 || sinceLast === 1) {
    current = 1;
    for (let i = unique.length - 1; i > 0; i -= 1) {
      if (diffDays(unique[i], unique[i - 1]) !== 1) break;
      current += 1;
    }
  }

  return { current, longest };
}

export function muscleGroupDistribution(workouts) {
  const counts = new Map();
  workouts.forEach((w) =>
    (w.exercises ?? []).forEach((e) => {
      const key = e.muscleGroup || "other";
      counts.set(key, (counts.get(key) ?? 0) + (e.sets?.length ?? 0));
    }),
  );
  return Array.from(counts.entries())
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value);
}

export function countPersonalRecords(workouts) {
  const best = new Map();
  let count = 0;

  [...workouts]
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .forEach((w) => {
      (w.exercises ?? []).forEach((e) => {
        const s = exerciseStats(e);
        const value = s.unit === "seconds" ? s.bestTime : s.bestWeight;
        if (!value) return;

        const prev = best.get(e.name);
        if (prev === undefined) {
          best.set(e.name, value);
          return;
        }
        if (value > prev) {
          best.set(e.name, value);
          count += 1;
        }
      });
    });

  return count;
}

export function volumeByPeriod(workouts, period = "week") {
  const keyFn = period === "month" ? monthKey : isoWeekKey;
  const map = new Map();

  [...workouts]
    .filter((w) => w?.date)
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .forEach((w) => {
      const key = keyFn(w.date);
      const entry = map.get(key) ?? {
        key,
        label: shortDate(w.date),
        volume: 0,
        count: 0,
      };
      entry.volume += Number(w.totalVolume) || workoutVolume(w);
      entry.count += 1;
      map.set(key, entry);
    });

  return Array.from(map.values()).map((e) => ({
    ...e,
    volume: Math.round(e.volume),
  }));
}

export function isRecordSet(unit, set, historyStats) {
  if (!historyStats?.entries?.length) return false;
  if (normalizeUnit(unit) === "seconds") {
    const s = toNum(set?.seconds);
    return s !== null && historyStats.bestTime > 0 && s > historyStats.bestTime;
  }
  const w = toNum(set?.weight);
  const r = toNum(set?.reps);
  return (
    w !== null && r !== null && r > 0 && historyStats.bestWeight > 0 && w > historyStats.bestWeight
  );
}

export function formSummary(form) {
  let sets = 0;
  let doneSets = 0;
  let volume = 0;
  (form?.exercises ?? []).forEach((e) => {
    const isSeconds = normalizeUnit(e.unit) === "seconds";
    (e.sets ?? []).forEach((s) => {
      sets += 1;
      if (s.done) doneSets += 1;
      if (!isSeconds && isFilledSet(e.unit, s)) volume += setVolume(s);
    });
  });
  return {
    exercises: (form?.exercises ?? []).length,
    sets,
    doneSets,
    volume: Math.round(volume),
  };
}
