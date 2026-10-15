import { normalizeUnit } from "./workout.js";
import { setVolume } from "./metrics.js";
import { MEASUREMENT_FIELDS } from "../constants/measurementFields.js";
import { muscleGroupLabel } from "../constants/muscleGroups.js";

const BACKUP_FORMAT = 1;

function plain(value) {
  if (value === null || value === undefined) return value ?? null;
  if (typeof value?.toDate === "function") {
    try {
      return value.toDate().toISOString();
    } catch {
      return null;
    }
  }
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(plain);
  if (typeof value === "object") {
    const out = {};
    Object.keys(value).forEach((k) => {
      out[k] = plain(value[k]);
    });
    return out;
  }
  return value;
}

const byDate = (list) =>
  [...(list ?? [])].sort((a, b) => String(a?.date ?? "").localeCompare(String(b?.date ?? "")));

export function buildBackup(data, exportedAt = new Date()) {
  return {
    app: "temir-jurnal",
    format: BACKUP_FORMAT,
    exportedAt: exportedAt.toISOString(),
    profile: plain(data.profile ?? null),
    workouts: plain(byDate(data.workouts)),
    exercises: plain(
      [...(data.exercises ?? [])].sort((a, b) => String(a.name).localeCompare(String(b.name))),
    ),
    measurements: plain(byDate(data.measurements)),
    templates: plain(data.templates ?? []),
    achievements: plain(data.achievements ?? []),
    photos: plain(byDate(data.photos)),
  };
}

const FORMULA_START = /^[=+\-@\t\r]/;

export function csvCell(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  let s = String(value);
  if (FORMULA_START.test(s)) s = "'" + s;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows) {
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function workoutsCsvRows(workouts) {
  const rows = [
    [
      "Sana",
      "Mashg'ulot turi",
      "Tana vazni (kg)",
      "Davomiylik (daq)",
      "Mashq",
      "Mushak guruhi",
      "Superset",
      "Set",
      "Vazn (kg)",
      "Takror",
      "Soniya",
      "Hajm (kg)",
      "Izoh",
    ],
  ];
  byDate(workouts).forEach((w) => {
    const duration = Number(w.durationSec) > 0 ? Math.round(w.durationSec / 60) : null;
    (w.exercises ?? []).forEach((e) => {
      const isSeconds = normalizeUnit(e.unit) === "seconds";
      (e.sets ?? []).forEach((s, i) => {
        rows.push([
          w.date ?? "",
          w.target ?? "",
          numOrNull(w.bodyWeight),
          duration,
          e.name ?? "",
          muscleGroupLabel(e.muscleGroup),
          e.supersetId ? "ha" : "",
          i + 1,
          isSeconds ? null : numOrNull(s.weight),
          isSeconds ? null : numOrNull(s.reps),
          isSeconds ? numOrNull(s.seconds) : null,
          isSeconds ? null : setVolume(s),
          i === 0 ? (e.note ?? "") : "",
        ]);
      });
    });
  });
  return rows;
}

export function measurementsCsvRows(measurements) {
  const rows = [["Sana", ...MEASUREMENT_FIELDS.map((f) => `${f.label} (sm)`)]];
  byDate(measurements).forEach((m) => {
    rows.push([m.date ?? "", ...MEASUREMENT_FIELDS.map((f) => numOrNull(m.values?.[f.key]))]);
  });
  return rows;
}

function numOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function exportFileName(kind, ext, dateISO) {
  return `temir-jurnal-${kind}-${dateISO}.${ext}`;
}
