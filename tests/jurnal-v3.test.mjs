import assert from "node:assert/strict";
const B = "../src/";
const {
  makeExercise,
  toFormWorkout,
  toStoredWorkout,
  isFormDirty,
  emptyWorkoutForm,
  fillSetFrom,
  normalizeSupersets,
  supersetInfo,
  linkWithNext,
  unlinkSuperset,
  workoutDurationSec,
  MAX_WORKOUT_SECONDS,
  serializeDraft,
  parseDraft,
  sanitizeFormWorkout,
} = await import(B + "utils/workout.js");
const { exerciseKey, searchExercises, recentExercises, makeTemplate } = await import(
  B + "utils/catalog.js"
);
const { isRecordSet, formSummary, exerciseHistoryStats } = await import(B + "utils/metrics.js");
const { dateLabel, formatClock, formatDuration, addDays, todayISO } = await import(
  B + "utils/date.js"
);

assert.equal(exerciseKey("O‘tirish"), exerciseKey("O'tirish"));
assert.equal(exerciseKey("Oʻtirish"), exerciseKey("o`tirish"));
assert.equal(exerciseKey("  Jim   bench "), "jim bench", "ichki bo'shliqlar ham");

const catalog = [
  { name: "Shtanga bilan jim", unit: "reps", muscleGroup: "chest" },
  { name: "Jim", unit: "reps", muscleGroup: "chest" },
  { name: "Qiya jim", unit: "reps", muscleGroup: "chest" },
  { name: "Plank", unit: "seconds", muscleGroup: "abs" },
  { name: "Najim", unit: "reps", muscleGroup: "other" },
];
assert.deepEqual(
  searchExercises(catalog, "jim").map((e) => e.name),
  ["Jim", "Qiya jim", "Shtanga bilan jim", "Najim"],
  "aniq > so'z boshi (alifbo) > o'rtasi",
);
assert.deepEqual(searchExercises(catalog, ""), []);
assert.equal(searchExercises(catalog, "jim", 2).length, 2, "limit");
assert.equal(searchExercises(catalog, "PLA")[0].name, "Plank", "registr ahamiyatsiz");

const recent = recentExercises(
  [
    { date: "2026-10-01", exercises: [{ name: "Jim" }, { name: "Plank" }] },
    {
      date: "2026-10-10",
      exercises: [{ name: "Turnik", unit: "reps", muscleGroup: "back" }, { name: "jim" }],
    },
  ],
  catalog,
);
assert.deepEqual(
  recent.map((e) => e.name),
  ["Turnik", "Jim", "Plank"],
  "yangisi birinchi, takrorsiz",
);
assert.equal(recent[1].muscleGroup, "chest", "katalogdagi meta olinadi");
assert.equal(recent[0].muscleGroup, "back", "katalogda yo'q -> mashg'ulotdan");
assert.equal(recentExercises([], catalog).length, 0);

const t = makeTemplate({
  id: "keep-me",
  name: "Push",
  exercises: [
    { name: "Jim", sets: "4", reps: " 8-10 " },
    { name: "Plank", unit: "seconds", sets: 99, reps: "x".repeat(40) },
    { name: "   " },
  ],
});
assert.equal(t.id, "keep-me", "tahrirlashda id saqlanadi");
assert.equal(t.exercises.length, 2, "nomsiz mashq tashlanadi");
assert.equal(t.exercises[0].sets, 4);
assert.equal(t.exercises[0].reps, "8-10");
assert.equal(t.exercises[1].sets, null, "chegaradan tashqari -> null");
assert.equal(t.exercises[1].reps.length, 15, "uzun matn qisqartiriladi");

const ex = makeExercise("Jim", "reps", undefined, "chest", { sets: 3, reps: "8-10" });
assert.equal(ex.sets.length, 3);
assert.equal(ex.goalReps, "8-10");
assert.ok(ex.sets.every((s) => s.done === false && s.weight === ""));
assert.equal(makeExercise("Plank", "seconds", 45).sets[0].seconds, "45", "taymerdan kelgan set");
assert.equal(makeExercise("X", "reps").sets.length, 1, "maqsadsiz -> 1 set");

assert.deepEqual(
  fillSetFrom("reps", { id: "a", weight: "", reps: "", done: false }, { weight: 60, reps: 8 }),
  { id: "a", weight: "60", reps: "8", done: false },
);
assert.equal(
  fillSetFrom("reps", { id: "a", weight: "70", reps: "", done: false }, { weight: 60, reps: 8 })
    .weight,
  "70",
  "kiritilgan qiymatga tegilmaydi",
);
const same = { id: "a", weight: "", reps: "" };
assert.equal(fillSetFrom("reps", same, null), same, "tavsiya yo'q -> o'zgarmaydi");

const ids = (list) => list.map((e) => e.supersetId);
const four = ["A", "B", "C", "D"].map((n) => ({ ...makeExercise(n, "reps"), supersetId: null }));
let linked = linkWithNext(four, 0);
assert.ok(linked[0].supersetId && linked[0].supersetId === linked[1].supersetId);
assert.equal(linked[2].supersetId, null);
assert.deepEqual(
  supersetInfo(linked).map((i) => i?.label ?? null),
  ["A1", "A2", null, null],
);
linked = linkWithNext(linked, 1);
assert.deepEqual(
  supersetInfo(linked).map((i) => i?.label ?? null),
  ["A1", "A2", "A3", null],
);
assert.equal(supersetInfo(linked)[2].isLast, true);
assert.equal(supersetInfo(linked)[1].isLast, false);
assert.equal(linkWithNext(linked, 3), linked, "oxirgisini 'keyingisi' bilan bog'lab bo'lmaydi");
const split = unlinkSuperset(linked, 1);
assert.deepEqual(ids(split), [null, null, null, null]);
const pair = linkWithNext(four, 2);
assert.deepEqual(ids(normalizeSupersets(pair.filter((_, i) => i !== 3))).slice(2), [null]);
const dup = normalizeSupersets([
  { supersetId: "x" },
  { supersetId: "x" },
  { supersetId: null },
  { supersetId: "x" },
  { supersetId: "x" },
]);
assert.equal(dup[0].supersetId, "x");
assert.ok(
  dup[3].supersetId && dup[3].supersetId !== "x" && dup[3].supersetId === dup[4].supersetId,
);
assert.deepEqual(
  supersetInfo(dup).map((i) => i?.label ?? null),
  ["A1", "A2", null, "B1", "B2"],
);

const form = {
  ...emptyWorkoutForm("2026-10-14"),
  exercises: [
    { ...makeExercise("A", "reps"), supersetId: "s1", sets: [{ weight: "50", reps: "10" }] },
    { ...makeExercise("B", "reps"), supersetId: "s1", sets: [{ weight: "", reps: "" }] },
  ],
};
assert.equal(
  toStoredWorkout(form).exercises[0].supersetId,
  null,
  "juftligi bo'sh -> superset emas",
);
form.exercises[1].sets = [{ weight: "20", reps: "12" }];
assert.deepEqual(ids(toStoredWorkout(form).exercises), ["s1", "s1"]);
assert.ok(!("done" in toStoredWorkout(form).exercises[0].sets[0]), "done Firestore'ga yozilmaydi");

const now = 1_000_000_000;
assert.equal(workoutDurationSec(now - 45 * 60 * 1000, now), 2700);
assert.equal(workoutDurationSec(null, now), null);
assert.equal(workoutDurationSec(null, now, 1800), 1800, "boshlanmagan -> eski qiymat");
assert.equal(
  workoutDurationSec(now - (MAX_WORKOUT_SECONDS + 60) * 1000, now),
  null,
  "5 soatdan uzun -> saqlanmaydi",
);
assert.equal(workoutDurationSec(now + 5000, now), null, "kelajak -> yo'q");
form.durationSec = 2700.4;
assert.equal(toStoredWorkout(form).durationSec, 2700);
assert.equal(toFormWorkout({ durationSec: 1800, exercises: [] }).durationSec, 1800);
assert.equal(formatClock(65), "1:05");
assert.equal(formatClock(3723), "1:02:03");
assert.equal(formatDuration(2700), "45 daq");
assert.equal(formatDuration(3900), "1 soat 5 daq");
assert.equal(formatDuration(20), "1 daq");
assert.equal(formatDuration(null), "");

assert.equal(
  toFormWorkout({ exercises: [{ name: "Jim", sets: [{ weight: 60, reps: 8 }] }] }).exercises[0]
    .sets[0].done,
  true,
);

assert.equal(isFormDirty(emptyWorkoutForm("2026-10-14")), false);
assert.equal(isFormDirty({ ...emptyWorkoutForm("2026-10-14"), target: "Push" }), true);
assert.equal(
  isFormDirty({ ...emptyWorkoutForm("2026-10-14"), bodyWeight: "80", bodyWeightTouched: false }),
  false,
  "avtomatik to'ldirilgan vazn qoralama emas",
);
const draftForm = {
  ...emptyWorkoutForm("2026-10-14"),
  startedAt: 123456,
  exercises: [
    { ...makeExercise("Jim", "reps"), sets: [{ id: "s", weight: "60", reps: "8", done: true }] },
  ],
};
const restored = parseDraft(serializeDraft(draftForm));
assert.equal(restored.exercises[0].sets[0].done, true);
assert.equal(restored.startedAt, 123456);
assert.equal(parseDraft("buzilgan json{"), null);
assert.equal(parseDraft(JSON.stringify({ v: 999, form: draftForm })), null, "boshqa versiya");
assert.equal(parseDraft(null), null);
const dirty = sanitizeFormWorkout({
  date: "14/10/2026",
  bodyWeight: 80,
  exercises: [
    { name: "Jim", unit: "kg", sets: [{ weight: 60, reps: null, done: "yes" }, null] },
    { name: "" },
    null,
  ],
});
assert.equal(dirty.date, "", "noto'g'ri sana tashlanadi");
assert.equal(dirty.bodyWeight, "80", "raqam -> matn");
assert.equal(dirty.exercises.length, 1, "nomsiz va null mashqlar tashlanadi");
assert.equal(dirty.exercises[0].unit, "reps");
assert.deepEqual(
  {
    w: dirty.exercises[0].sets[0].weight,
    r: dirty.exercises[0].sets[0].reps,
    d: dirty.exercises[0].sets[0].done,
  },
  { w: "60", r: "", d: false },
);
assert.equal(dirty.exercises[0].sets.length, 1);
assert.equal(sanitizeFormWorkout("matn"), null);

const history = [
  {
    date: "2026-10-01",
    exercises: [{ name: "Jim", unit: "reps", sets: [{ weight: 80, reps: 5 }] }],
  },
];
const hs = exerciseHistoryStats(history, "Jim");
assert.equal(isRecordSet("reps", { weight: "82.5", reps: "3" }, hs), true);
assert.equal(isRecordSet("reps", { weight: "80", reps: "8" }, hs), false, "teng — rekord emas");
assert.equal(isRecordSet("reps", { weight: "90", reps: "" }, hs), false, "takrorsiz — hali emas");
assert.equal(
  isRecordSet("reps", { weight: "90", reps: "1" }, exerciseHistoryStats([], "Jim")),
  false,
  "birinchi marta — rekord emas",
);
const ps = exerciseHistoryStats(
  [
    {
      date: "2026-10-01",
      exercises: [{ name: "Plank", unit: "seconds", sets: [{ seconds: 60 }] }],
    },
  ],
  "Plank",
);
assert.equal(isRecordSet("seconds", { seconds: "75" }, ps), true);

assert.deepEqual(
  formSummary({
    exercises: [
      {
        unit: "reps",
        sets: [
          { weight: "100", reps: "5", done: true },
          { weight: "", reps: "", done: false },
        ],
      },
      { unit: "seconds", sets: [{ seconds: "60", done: true }] },
    ],
  }),
  { exercises: 2, sets: 3, doneSets: 2, volume: 500 },
);

const today = todayISO();
assert.ok(dateLabel(today).startsWith("Bugun, "));
assert.ok(dateLabel(addDays(today, -1)).startsWith("Kecha, "));
assert.equal(dateLabel("2026-10-13", "2026-10-20"), "Seshanba, 13.10.2026");
assert.equal(dateLabel(""), "Sanani tanlang");

console.log("Jurnal v3 mantig'i: tekshiruvlar o'tdi ✓");

{
  const { syncStartedAt } = await import(B + "utils/workout.js");

  const f = { startedAt: 123, exercises: [{ sets: [{ done: false }] }] };
  assert.equal(syncStartedAt(f).startedAt, null);
  const g = { startedAt: 123, exercises: [{ sets: [{ done: true }] }] };
  assert.equal(syncStartedAt(g), g, "✓ bor — o'zgarmaydi");
  assert.equal(syncStartedAt({ startedAt: 123, exercises: [] }).startedAt, null, "mashq yo'q");
  assert.equal(
    sanitizeFormWorkout({ startedAt: 999, exercises: [{ name: "Jim", sets: [{ weight: "1" }] }] })
      .startedAt,
    null,
  );
}
console.log("Sekundomer: tekshiruvlar o'tdi ✓");
