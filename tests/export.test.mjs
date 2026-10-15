import assert from "node:assert/strict";
const B = "../src/";
const { buildBackup, csvCell, toCsv, workoutsCsvRows, measurementsCsvRows, exportFileName } =
  await import(B + "utils/export.js");

assert.equal(csvCell(null), "");
assert.equal(csvCell(72.5), "72.5");
assert.equal(csvCell(NaN), "");
assert.equal(csvCell("Jim"), "Jim");
assert.equal(csvCell("a,b"), '"a,b"');
assert.equal(csvCell('say "hi"'), '"say ""hi"""');
assert.equal(csvCell("line\nbreak"), '"line\nbreak"');
assert.equal(csvCell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"');
assert.equal(csvCell("+998901234567"), "'+998901234567");
assert.equal(csvCell(-5), "-5", "manfiy RAQAM o'zgarmaydi");
assert.equal(
  toCsv([
    ["a", 1],
    ["b", null],
  ]),
  "a,1\r\nb,",
);

const workouts = [
  {
    date: "2026-10-10",
    target: "Push",
    bodyWeight: 80,
    durationSec: 3000,
    exercises: [
      {
        name: "Jim",
        unit: "reps",
        muscleGroup: "chest",
        note: "yengil",
        supersetId: "s",
        sets: [
          { weight: 60, reps: 10 },
          { weight: 70, reps: 8 },
        ],
      },
      { name: "Plank", unit: "seconds", muscleGroup: "abs", sets: [{ seconds: 60 }] },
    ],
  },
  {
    date: "2026-10-01",
    exercises: [{ name: "Turnik", unit: "reps", sets: [{ weight: null, reps: 12 }] }],
  },
];
const rows = workoutsCsvRows(workouts);
assert.equal(rows.length, 1 + 4);
assert.equal(rows[1][0], "2026-10-01", "eski sana birinchi");
assert.deepEqual(rows[2].slice(0, 13), [
  "2026-10-10",
  "Push",
  80,
  50,
  "Jim",
  "Ko'krak",
  "ha",
  1,
  60,
  10,
  null,
  600,
  "yengil",
]);
assert.equal(rows[3][12], "", "izoh faqat birinchi setda");
assert.equal(rows[4][10], 60, "soniya ustuni");
assert.equal(rows[4][11], null, "soniyalik mashqda hajm yo'q");

const mRows = measurementsCsvRows([{ date: "2026-10-01", values: { bel: 80 } }]);
assert.equal(mRows[0][1], "Bel (sm)");
assert.equal(mRows[1][1], 80);
assert.equal(mRows[1][2], null);

const ts = { toDate: () => new Date("2026-10-14T10:00:00Z") };
const backup = buildBackup(
  {
    profile: { displayName: "Ali", updatedAt: ts },
    workouts: [{ date: "2026-10-02", createdAt: ts }, { date: "2026-10-01" }],
  },
  new Date("2026-10-14T12:00:00Z"),
);
assert.equal(backup.app, "temir-jurnal");
assert.equal(backup.exportedAt, "2026-10-14T12:00:00.000Z");
assert.equal(backup.profile.updatedAt, "2026-10-14T10:00:00.000Z");
assert.equal(backup.workouts[0].date, "2026-10-01");
assert.equal(backup.workouts[1].createdAt, "2026-10-14T10:00:00.000Z");
assert.deepEqual(backup.measurements, []);
assert.doesNotThrow(() => JSON.stringify(backup));

assert.equal(exportFileName("zaxira", "json", "2026-10-14"), "temir-jurnal-zaxira-2026-10-14.json");

console.log("Eksport: tekshiruvlar o'tdi ✓");
