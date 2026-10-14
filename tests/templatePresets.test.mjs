import assert from "node:assert/strict";
const B = "../src/";
const { TEMPLATE_PRESETS } = await import(B + "constants/templatePresets.js");
const { MUSCLE_GROUPS } = await import(B + "constants/muscleGroups.js");
const { makeTemplate, exerciseKey } = await import(B + "utils/catalog.js");

const groups = new Set(MUSCLE_GROUPS.map((g) => g.key));

assert.ok(TEMPLATE_PRESETS.length >= 2, "kamida ikkita namuna");

const keys = TEMPLATE_PRESETS.map((p) => p.key);
assert.equal(new Set(keys).size, keys.length, "namuna kalitlari noyob");

TEMPLATE_PRESETS.forEach((p) => {
  // firestore.rules: name 1..60, target <=100, exercises <=60
  assert.ok(p.name.length > 0 && p.name.length <= 60, p.key + ": nom uzunligi");
  assert.ok(p.target.length <= 100, p.key + ": target uzunligi");
  assert.ok(p.exercises.length > 0 && p.exercises.length <= 60, p.key + ": mashqlar soni");

  const names = p.exercises.map((e) => exerciseKey(e.name));
  assert.equal(new Set(names).size, names.length, p.key + ": mashqlar takrorlanmaydi");

  p.exercises.forEach((e) => {
    assert.ok(["reps", "seconds"].includes(e.unit), `${p.key}/${e.name}: birlik`);
    // "other" bo'lsa grafikda foydasiz — namunada aniq guruh bo'lishi shart
    assert.ok(groups.has(e.muscleGroup) && e.muscleGroup !== "other", `${p.key}/${e.name}: guruh`);
  });

  // makeTemplate orqali o'tganda hech narsa yo'qolmaydi (reja ham)
  const t = makeTemplate(p);
  assert.deepEqual(
    t.exercises.map((e) => [e.name, e.unit, e.muscleGroup, e.sets, e.reps]),
    p.exercises.map((e) => [e.name, e.unit, e.muscleGroup, e.sets, e.reps]),
    p.key + ": saqlash shakli",
  );
  assert.ok(Array.isArray(p.days) && p.days.length > 0, p.key + ": kunlar belgilangan");
  assert.deepEqual(t.days, p.days, p.key + ": kunlar saqlanadi");
  p.exercises.forEach((e) => {
    assert.ok(Number.isInteger(e.sets) && e.sets >= 1 && e.sets <= 20, `${p.key}/${e.name}: set rejasi`);
    assert.ok(e.reps && e.reps.length <= 15, `${p.key}/${e.name}: takror maqsadi`);
  });
});

// Bir xil nomli mashq turli namunalarda turli birlik/guruh bilan kelmasligi
// kerak — katalogga birinchisi yoziladi.
const seen = new Map();
TEMPLATE_PRESETS.flatMap((p) => p.exercises).forEach((e) => {
  const sig = e.unit + "/" + e.muscleGroup;
  const prev = seen.get(exerciseKey(e.name));
  if (prev) assert.equal(prev, sig, e.name + ": namunalar orasida bir xil");
  seen.set(exerciseKey(e.name), sig);
});

// Namunalar bir kunga ikki marta tushmaydi
const allDays = TEMPLATE_PRESETS.flatMap((p) => p.days);
assert.equal(new Set(allDays).size, allDays.length, "har kun — bitta namuna");

console.log("Namuna dasturlar: tekshiruvlar o'tdi ✓");
