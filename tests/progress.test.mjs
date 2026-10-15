import assert from "node:assert/strict";
const B = "../src/";
const { toFormSets } = await import(B + "utils/workout.js");
const { suggestProgression, exerciseHistoryStats } = await import(B + "utils/metrics.js");
const { makeTemplate } = await import(B + "utils/catalog.js");

const prevSets = [
  { id: "old1", weight: 70, reps: 8 },
  { id: "old2", weight: 75, reps: 6 },
];
const formSets = toFormSets("reps", prevSets);
assert.equal(formSets[0].weight, "70", "forma uchun matn");
assert.equal(formSets[0].reps, "8");
assert.notEqual(formSets[0].id, "old1", "id qayta yaratiladi");
assert.notEqual(formSets[0].id, formSets[1].id, "id'lar takrorlanmaydi");
assert.deepEqual(toFormSets("seconds", [{ seconds: 45 }])[0].seconds, "45");
assert.deepEqual(toFormSets("reps", null), [], "bo'sh ro'yxat qulatmaydi");

const ex = {
  unit: "reps",
  sets: [
    { weight: 60, reps: 10 },
    { weight: 80, reps: 4 },
    { weight: 70, reps: 8 },
  ],
};
assert.deepEqual(suggestProgression(ex, 2.5), { unit: "reps", weight: 82.5, reps: 4 });
assert.deepEqual(suggestProgression(ex, 5), { unit: "reps", weight: 85, reps: 4 });
assert.deepEqual(suggestProgression({ unit: "seconds", sets: [{ seconds: 60 }] }), {
  unit: "seconds",
  seconds: 75,
});
assert.equal(suggestProgression(null), null);
assert.equal(suggestProgression({ unit: "reps", sets: [] }), null);

const history = [
  {
    date: "2026-09-01",
    exercises: [{ name: "Jim", unit: "reps", sets: [{ weight: 70, reps: 8 }] }],
  },
  {
    date: "2026-09-10",
    exercises: [{ name: "Jim", unit: "reps", sets: [{ weight: 85, reps: 3 }] }],
  },
  {
    date: "2026-09-05",
    exercises: [{ name: "Jim", unit: "reps", sets: [{ weight: 75, reps: 10 }] }],
  },
];
const st = exerciseHistoryStats(history, "Jim");
assert.equal(st.bestWeight, 85);
assert.equal(st.bestReps, 10);
assert.equal(st.bestVolume, 750, "75x10 eng katta volume");
assert.equal(st.last.date, "2026-09-10", "sanalar bo'yicha saralanadi");
assert.equal(st.best1RM, 100, "75kg x10 -> Epley 1RM aynan 100");

const t = makeTemplate({
  name: "  Push Day  ",
  target: "Ko'krak",
  exercises: [
    { name: "Jim", unit: "reps" },
    { name: "Plank", unit: "seconds", muscleGroup: "abs" },
  ],
});
assert.equal(t.name, "Push Day", "nom tozalanadi");
assert.equal(t.exercises[1].muscleGroup, "abs");
assert.equal(t.exercises[0].muscleGroup, "other", "guruh berilmagan -> other");
assert.ok(t.id);
assert.equal(makeTemplate({ name: "X" }).exercises.length, 0);

console.log("2-bosqich mantig'i: 20 tekshiruv o'tdi ✓");
