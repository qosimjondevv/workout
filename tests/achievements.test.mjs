import assert from "node:assert/strict";
const B = "../src/";
const { ACHIEVEMENTS } = await import(B + "constants/achievements.js");
const { achievementStats, evaluateAchievements, findAchievement } = await import(
  B + "utils/achievements.js"
);
const { normalizePhotoKind } = await import(B + "constants/photoKinds.js");

const keys = ACHIEVEMENTS.map((a) => a.key);
assert.equal(new Set(keys).size, keys.length, "yutuq kalitlari takrorlanmaydi");
ACHIEVEMENTS.forEach((a) => {
  assert.ok(["workouts", "streak", "pr", "volume"].includes(a.metric), a.key + ": metric");
  assert.ok(a.threshold > 0 && a.label && a.description, a.key + ": maydonlar");
});

assert.deepEqual(evaluateAchievements({ workouts: 0, streak: 0, pr: 0, volume: 0 }), []);
assert.deepEqual(evaluateAchievements({ workouts: 1, streak: 0, pr: 0, volume: 0 }), [
  "first-workout",
]);
const many = evaluateAchievements({ workouts: 100, streak: 30, pr: 10, volume: 1000000 });
assert.equal(many.length, ACHIEVEMENTS.length, "hamma chegara oshsa hammasi ochiladi");
assert.ok(evaluateAchievements({ workouts: 10 }).includes("workouts-10"));
assert.ok(!evaluateAchievements({ workouts: 9 }).includes("workouts-10"));
assert.doesNotThrow(() => evaluateAchievements(null));
assert.deepEqual(evaluateAchievements(undefined), []);

const w = (date, weight, reps, totalVolume) => ({
  date,
  totalVolume,
  exercises: [{ name: "Jim", unit: "reps", sets: [{ weight, reps }] }],
});
const stats = achievementStats([w("2026-01-01", 70, 5), w("2026-01-02", 80, 5)]);
assert.equal(stats.workouts, 2);
assert.equal(stats.streak, 2, "ketma-ket ikki kun");
assert.equal(stats.pr, 1, "70 -> 80 bitta rekord");
assert.equal(stats.volume, 750, "350 + 400");
assert.equal(achievementStats([w("2026-01-01", 70, 5, 9999)]).volume, 9999);
assert.deepEqual(achievementStats([]), { workouts: 0, streak: 0, pr: 0, volume: 0 });

assert.equal(findAchievement("first-workout").label, "Birinchi qadam");
assert.equal(findAchievement("yoq-bunday"), null);

assert.equal(normalizePhotoKind("side"), "side");
assert.equal(normalizePhotoKind("hacked"), "front");
assert.equal(normalizePhotoKind(undefined), "front");

console.log("4-bosqich mantig'i: 25 tekshiruv o'tdi ✓");
