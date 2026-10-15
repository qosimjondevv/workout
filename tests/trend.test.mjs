import assert from "node:assert/strict";
const B = "../src/";
const { computeTrend } = await import(B + "utils/trend.js");
const { REST_PRESETS } = await import(B + "constants/restPresets.js");

const t1 = computeTrend([{ v: 60 }, { v: 65 }], "v");
assert.equal(t1.diff, 5);
assert.equal(t1.percent, 8.3, "60 -> 65 = +8.3%");
assert.equal(t1.direction, "up");

const t2 = computeTrend([{ v: 100 }, { v: 105 }], "v");
assert.equal(t2.diff, 5, "absolyut farq bir xil");
assert.equal(t2.percent, 5, "lekin foiz boshqa — aynan shu uchun kerak");

const t3 = computeTrend([{ v: 80 }, { v: 72 }], "v");
assert.equal(t3.diff, -8);
assert.equal(t3.percent, -10);
assert.equal(t3.direction, "down");

assert.equal(computeTrend([{ v: 0 }, { v: 5 }], "v").percent, null, "nolga bo'linmaydi");
assert.equal(computeTrend([{ v: 5 }], "v"), null, "bitta nuqta trend emas");
assert.equal(computeTrend([], "v"), null);
assert.equal(computeTrend(null, "v"), null);
assert.equal(computeTrend([{ v: "yoq" }, { v: 5 }], "v"), null, "raqam bo'lmasa null");
assert.equal(computeTrend([{ v: 70 }, { v: 70 }], "v").direction, "same");
assert.equal(computeTrend([{ v: 10 }, { v: 99 }, { v: 20 }], "v").diff, 10);

assert.ok(REST_PRESETS.length >= 4);
assert.deepEqual(
  REST_PRESETS.map((p) => p.seconds),
  [30, 60, 90, 120, 180],
  "spetsifikatsiyadagi 30/60/90/120 bor",
);

console.log("Yakuniy tuzatishlar: 16 tekshiruv o'tdi ✓");
