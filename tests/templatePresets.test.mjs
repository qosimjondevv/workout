import assert from "node:assert/strict";
const B = "../src/";
const { TEMPLATE_PRESETS } = await import(B + "constants/templatePresets.js");
const { MUSCLE_GROUPS } = await import(B + "constants/muscleGroups.js");
const { makeTemplate, exerciseKey } = await import(B + "utils/catalog.js");

const groups = new Set(MUSCLE_GROUPS.map((g) => g.key));

assert.equal(TEMPLATE_PRESETS.length, 2, "ikkita namuna");

const keys = TEMPLATE_PRESETS.map((p) => p.key);
assert.equal(new Set(keys).size, keys.length, "namuna kalitlari noyob");

TEMPLATE_PRESETS.forEach((p) => {
  assert.ok(p.name.length > 0 && p.name.length <= 60, p.key + ": nom uzunligi");
  assert.ok(p.target.length <= 100, p.key + ": target uzunligi");
  assert.ok(p.exercises.length > 0 && p.exercises.length <= 60, p.key + ": mashqlar soni");

  const names = p.exercises.map((e) => exerciseKey(e.name));
  assert.equal(new Set(names).size, names.length, p.key + ": mashqlar takrorlanmaydi");

  p.exercises.forEach((e) => {
    assert.ok(["reps", "seconds"].includes(e.unit), `${p.key}/${e.name}: birlik`);
    assert.ok(groups.has(e.muscleGroup) && e.muscleGroup !== "other", `${p.key}/${e.name}: guruh`);
  });

  const t = makeTemplate(p);
  assert.deepEqual(
    t.exercises.map((e) => [e.name, e.unit, e.muscleGroup, e.sets, e.reps]),
    p.exercises.map((e) => [e.name, e.unit, e.muscleGroup, e.sets, e.reps]),
    p.key + ": saqlash shakli",
  );
  p.exercises.forEach((e) => {
    assert.ok(
      Number.isInteger(e.sets) && e.sets >= 1 && e.sets <= 20,
      `${p.key}/${e.name}: set rejasi`,
    );
    assert.ok(e.reps && e.reps.length <= 15, `${p.key}/${e.name}: takror maqsadi`);
  });
});

const seen = new Map();
TEMPLATE_PRESETS.flatMap((p) => p.exercises).forEach((e) => {
  const sig = e.unit + "/" + e.muscleGroup;
  const prev = seen.get(exerciseKey(e.name));
  if (prev) assert.equal(prev, sig, e.name + ": namunalar orasida bir xil");
  seen.set(exerciseKey(e.name), sig);
});

console.log("Namuna dasturlar: tekshiruvlar o'tdi ✓");
