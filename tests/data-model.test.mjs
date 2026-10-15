import assert from "node:assert/strict";
const B = "../src/";
const { toNum, toStr, round } = await import(B + "utils/num.js");
const { toStoredWorkout, toFormWorkout, formatSet, workoutHasContent } = await import(
  B + "utils/workout.js"
);
const {
  workoutVolume,
  estimated1RM,
  computeStreaks,
  findPreviousExercise,
  suggestProgression,
  muscleGroupDistribution,
} = await import(B + "utils/metrics.js");
const { todayISO, addDays } = await import(B + "utils/date.js");

assert.equal(toNum(""), null);
assert.equal(toNum("   "), null);
assert.equal(toNum("0"), 0, "nol null EMAS");
assert.equal(toNum("72,5"), 72.5, "vergul ham qabul qilinadi");
assert.equal(toNum("abc"), null);
assert.equal(toStr(null), "");
assert.equal(round(72.549, 1), 72.5);

const legacy = {
  id: "w1",
  date: "2026-09-18",
  target: "Ko'krak",
  bodyWeight: "78.5",
  exercises: [
    {
      name: "Jim",
      unit: "reps",
      sets: [
        { weight: "60", reps: "8" },
        { weight: "65", reps: "6" },
        { weight: "", reps: "" },
      ],
    },
  ],
};
const stored = toStoredWorkout(legacy);
assert.equal(stored.id, "w1", "ID saqlanadi");
assert.equal(stored.bodyWeight, 78.5);
assert.equal(typeof stored.exercises[0].sets[0].weight, "number", "raqamga o'girildi");
assert.equal(stored.exercises[0].sets.length, 2, "bo'sh set tashlandi");
assert.equal(stored.exercises[0].muscleGroup, "other", "guruh belgilanmagan -> other");
assert.ok(
  stored.exercises[0].sets.every((s) => s.id),
  "har set id oladi",
);

assert.equal(workoutVolume(stored), 870);

const form = toFormWorkout(stored);
assert.equal(form.bodyWeight, "78.5", "forma uchun matn");
assert.equal(form.exercises[0].sets[0].weight, "60");
stored.exercises[0].name = "O'ZGARDI";
assert.equal(form.exercises[0].name, "Jim", "chuqur nusxa");

assert.equal(workoutHasContent({ exercises: [] }), false);
assert.equal(
  workoutHasContent({ exercises: [{ unit: "reps", sets: [{ weight: "", reps: "" }] }] }),
  false,
);
assert.equal(toStoredWorkout({ date: "2026-01-01", exercises: [] }).exercises.length, 0);

assert.equal(estimated1RM(100, 1), 100, "bitta takror = vaznning o'zi");
assert.equal(estimated1RM(100, 10), 133.3);
assert.equal(estimated1RM(0, 5), 0);
assert.equal(estimated1RM("abc", 5), 0);

const t = todayISO();
assert.deepEqual(computeStreaks([]), { current: 0, longest: 0 });
assert.deepEqual(computeStreaks([t, addDays(t, -1), addDays(t, -2)]), { current: 3, longest: 3 });
assert.equal(computeStreaks([addDays(t, -1), addDays(t, -2)]).current, 2);
const old = computeStreaks([addDays(t, -5), addDays(t, -4), addDays(t, -3)]);
assert.equal(old.current, 0);
assert.equal(old.longest, 3);
assert.equal(computeStreaks([t, t, t]).current, 1);

const history = [
  {
    id: "a",
    date: "2026-09-10",
    exercises: [{ name: "Jim", unit: "reps", sets: [{ weight: 70, reps: 8 }] }],
  },
  {
    id: "b",
    date: "2026-09-15",
    exercises: [{ name: "Jim", unit: "reps", sets: [{ weight: 75, reps: 6 }] }],
  },
];
const prev = findPreviousExercise(history, "Jim", "2026-09-18");
assert.equal(prev.date, "2026-09-15", "eng oxirgisi olinadi");
const sug = suggestProgression(prev.exercise, 2.5);
assert.deepEqual(sug, { unit: "reps", weight: 77.5, reps: 6 });
assert.equal(
  findPreviousExercise(
    history.filter((w) => w.id !== "b"),
    "Jim",
    "2026-09-18",
  ).date,
  "2026-09-10",
  "tahrirlanayotgan yozuv tarixdan chiqariladi",
);
assert.equal(findPreviousExercise(history, "Yo'q mashq", "2026-09-18"), null);

const dist = muscleGroupDistribution([
  {
    exercises: [
      { muscleGroup: "chest", sets: [1, 2, 3] },
      { muscleGroup: "legs", sets: [1] },
    ],
  },
]);
assert.deepEqual(dist, [
  { key: "chest", value: 3 },
  { key: "legs", value: 1 },
]);

assert.equal(formatSet("reps", { weight: 60, reps: 8 }), "60kg×8");
assert.equal(formatSet("reps", { weight: 60, reps: null }), "60kg");
assert.equal(formatSet("seconds", { seconds: 45 }), "45s");

console.log("Yangi modellar bo'yicha 35+ tekshiruv o'tdi ✓");
