import assert from "node:assert/strict";
const B = "../src/";
const { exerciseKey, findExerciseMeta, makeTemplate } = await import(B + "utils/catalog.js");
const { makeExercise } = await import(B + "utils/workout.js");
const { muscleGroupDistribution } = await import(B + "utils/metrics.js");

const catalog = [
  { id: "1", name: "Jim", unit: "reps", muscleGroup: "chest" },
  { id: "2", name: "Plank", unit: "seconds", muscleGroup: "abs" },
];

assert.equal(exerciseKey("  Jim  "), "jim");
assert.equal(exerciseKey(null), "");

assert.deepEqual(findExerciseMeta("  jim ", catalog), {
  name: "Jim",
  unit: "reps",
  muscleGroup: "chest",
});
assert.equal(findExerciseMeta("plank", catalog).unit, "seconds");
assert.equal(findExerciseMeta("Yo'q", catalog), null, "topilmasa taxmin qilinmaydi");
assert.equal(findExerciseMeta("", catalog), null);
assert.equal(findExerciseMeta("Jim", null, undefined), null, "bo'sh manba qulatmaydi");

const form = [
  { name: "Plank", unit: "reps", muscleGroup: "other" },
  { name: "Wall sit", unit: "seconds", muscleGroup: "legs" },
];
assert.equal(findExerciseMeta("Plank", catalog, form).unit, "seconds", "katalog ustun");
assert.deepEqual(findExerciseMeta("wall sit", catalog, form), {
  name: "Wall sit",
  unit: "seconds",
  muscleGroup: "legs",
});
assert.deepEqual(findExerciseMeta("X", [{ name: "X", unit: "kg", muscleGroup: "hacked" }]), {
  name: "X",
  unit: "reps",
  muscleGroup: "other",
});

const meta = findExerciseMeta("jim", catalog);
const ex = makeExercise(meta.name, meta.unit, null, meta.muscleGroup);
assert.equal(ex.muscleGroup, "chest");
assert.deepEqual(
  muscleGroupDistribution([{ exercises: [ex] }]),
  [{ key: "chest", value: 1 }],
  "chip orqali qo'shilgan mashq 'other' ga tushmaydi",
);

const t = makeTemplate({
  name: "Core",
  exercises: [findExerciseMeta("Wall sit", catalog, form)],
});
assert.equal(t.exercises[0].unit, "seconds");
assert.equal(t.exercises[0].muscleGroup, "legs");

console.log("Katalog yordamchilari: 16 tekshiruv o'tdi ✓");
