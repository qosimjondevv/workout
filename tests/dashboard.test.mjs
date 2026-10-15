import assert from "node:assert/strict";
const B = "../src/";
const { countPersonalRecords, volumeByPeriod } = await import(B + "utils/metrics.js");
const { monthMatrix, monthLabel, addMonths, shortDate } = await import(B + "utils/date.js");
const { formatCompact } = await import(B + "utils/num.js");

const mk = (date, name, weight) => ({
  date,
  exercises: [{ name, unit: "reps", sets: [{ weight, reps: 5 }] }],
});
assert.equal(
  countPersonalRecords([mk("2026-01-01", "Jim", 70)]),
  0,
  "birinchi marta = boshlang'ich",
);
assert.equal(
  countPersonalRecords([mk("2026-01-01", "Jim", 70), mk("2026-01-08", "Jim", 75)]),
  1,
  "yaxshilanish = 1 rekord",
);
assert.equal(
  countPersonalRecords([
    mk("2026-01-01", "Jim", 70),
    mk("2026-01-08", "Jim", 75),
    mk("2026-01-15", "Jim", 72),
    mk("2026-01-22", "Jim", 80),
  ]),
  2,
  "pasayish sanalmaydi",
);
assert.equal(
  countPersonalRecords([mk("2026-01-22", "Jim", 80), mk("2026-01-01", "Jim", 70)]),
  1,
  "xronologiya bo'yicha saralanadi",
);
assert.equal(
  countPersonalRecords([
    mk("2026-01-01", "Jim", 70),
    mk("2026-01-02", "Squat", 100),
    mk("2026-01-09", "Squat", 110),
  ]),
  1,
);
assert.equal(countPersonalRecords([]), 0);

const w = (date, weight, reps) => ({
  date,
  exercises: [{ name: "Jim", unit: "reps", sets: [{ weight, reps }] }],
});
const weekly = volumeByPeriod([w("2026-09-14", 100, 5), w("2026-09-16", 100, 3)], "week");
assert.equal(weekly.length, 1, "bir hafta ichidagi ikki mashg'ulot birlashadi");
assert.equal(weekly[0].volume, 800, "500 + 300");
assert.equal(weekly[0].count, 2);
assert.equal(weekly[0].label, "14.09", "davr eng erta sana bilan belgilanadi");

const monthly = volumeByPeriod([w("2026-08-31", 10, 1), w("2026-09-01", 10, 2)], "month");
assert.equal(monthly.length, 2, "avgust va sentabr ajraladi");
assert.equal(monthly[0].label, "31.08", "o'sish tartibida");
assert.equal(
  volumeByPeriod([{ date: "2026-09-14", totalVolume: 1234, exercises: [] }])[0].volume,
  1234,
);
assert.deepEqual(volumeByPeriod([]), []);

const weeks = monthMatrix("2026-09-18");
assert.equal(weeks.length, 6, "har doim 6 qator (balandlik sakramaydi)");
assert.ok(weeks.every((wk) => wk.length === 7));
weeks.forEach((wk) =>
  assert.equal(new Date(wk[0].iso + "T00:00:00").getDay(), 1, "hafta dushanbadan boshlanadi"),
);
const flat = weeks.flat();
const inMonth = flat.filter((d) => d.inMonth).map((d) => d.iso);
assert.equal(inMonth.length, 30, "sentabrda 30 kun");
assert.equal(inMonth[0], "2026-09-01");
assert.equal(inMonth[29], "2026-09-30");
assert.ok(
  flat.some((d) => !d.inMonth),
  "qo'shni oy kunlari ham to'ldiriladi",
);
assert.equal(
  monthMatrix("2024-02-10")
    .flat()
    .filter((d) => d.inMonth).length,
  29,
);

assert.equal(monthLabel("2026-09-18"), "Sentabr 2026");
assert.equal(addMonths("2026-01-31", 1), "2026-02-01", "oy chekkasida sirg'anmaydi");
assert.equal(addMonths("2026-01-15", -1), "2025-12-01");
assert.equal(shortDate("2026-09-05"), "05.09");

assert.equal(formatCompact(999), "999");
assert.equal(formatCompact(1000), "1k");
assert.equal(formatCompact(12345), "12.3k");
assert.equal(formatCompact(1500000), "1.5M");
assert.equal(formatCompact(null), "-");

console.log("3-bosqich mantig'i: 30 tekshiruv o'tdi ✓");
