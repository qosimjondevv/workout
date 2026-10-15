import assert from "node:assert/strict";
const B = "../src/";
const { bodyWeightSeries, latestBodyWeight } = await import(B + "utils/metrics.js");
const { validateMeasurement, toStoredMeasurement } = await import(B + "utils/catalog.js");
const { MEASUREMENT_FIELDS, CIRCUMFERENCE_FIELDS, BODY_WEIGHT_KEY, measurementField } =
  await import(B + "constants/measurementFields.js");

assert.equal(MEASUREMENT_FIELDS[0].key, BODY_WEIGHT_KEY, "vazn birinchi");
assert.equal(measurementField("vazn").unit, "kg");
assert.ok(CIRCUMFERENCE_FIELDS.every((f) => f.unit === "sm"));
assert.equal(CIRCUMFERENCE_FIELDS.length, MEASUREMENT_FIELDS.length - 1);
assert.equal(measurementField("yo'q").key, "vazn", "noma'lum kalit -> birinchisi");

const workouts = [
  { date: "2026-10-01", bodyWeight: 80 },
  { date: "2026-10-05", bodyWeight: 79 },
  { date: "2026-10-07", bodyWeight: null },
  { date: "2026-10-08", bodyWeight: 0 },
];
const measurements = [
  { date: "2026-10-05", values: { vazn: 78.6 } },
  { date: "2026-10-03", values: { vazn: 79.5, bel: 82 } },
  { date: "2026-10-09", values: { bel: 81 } },
];
assert.deepEqual(bodyWeightSeries(workouts, measurements), [
  { date: "2026-10-01", weight: 80 },
  { date: "2026-10-03", weight: 79.5 },
  { date: "2026-10-05", weight: 78.6 },
]);
assert.equal(latestBodyWeight(workouts, measurements), 78.6, "bir kunda o'lchov ustun");
assert.equal(latestBodyWeight([], []), null);
assert.deepEqual(bodyWeightSeries(undefined, undefined), []);
assert.equal(latestBodyWeight([{ date: "2026-10-10", bodyWeight: "81,5" }], []), 81.5);

assert.equal(validateMeasurement({}), "Kamida bitta o'lchovni kiriting");
assert.equal(validateMeasurement({ vazn: "  " }), "Kamida bitta o'lchovni kiriting");
assert.equal(validateMeasurement({ vazn: "78.5" }), "");
assert.equal(validateMeasurement({ bel: "80" }), "", "vaznsiz ham saqlanadi");
assert.equal(validateMeasurement({ vazn: "785" }), "Tana vazni 20–400 kg oralig'ida bo'lsin");
assert.equal(validateMeasurement({ vazn: "78", bel: "5" }), "Bel 10–300 sm oralig'ida bo'lsin");

const stored = toStoredMeasurement({
  date: "2026-10-15",
  values: { vazn: "78,4", bel: "", oyoq: "55" },
});
assert.deepEqual(stored.values, { vazn: 78.4, oyoq: 55 });

console.log("Tana vazni: tekshiruvlar o'tdi ✓");
