import { uid } from "./id.js";
import { toNum } from "./num.js";
import { normalizeUnit } from "./workout.js";
import { normalizeMuscleGroup } from "../constants/muscleGroups.js";
import { MEASUREMENT_FIELDS } from "../constants/measurementFields.js";

// Hujjat "fabrikalari" — sof funksiyalar, Firebase'ga bog'liq emas.
// Ular servis ichida turganda har bir test Firebase'ni ham yuklashga majbur
// bo'lardi; bu yerda esa alohida sinash mumkin (spetsifikatsiya 15-band).

// --- Mashqlar katalogi ---
export function makeExerciseDoc({ name, unit, muscleGroup }) {
  return {
    id: uid(),
    name: String(name ?? "").trim(),
    unit: normalizeUnit(unit),
    muscleGroup: normalizeMuscleGroup(muscleGroup),
  };
}

// Telefon klaviaturalari o'zbekcha apostrofni turlicha beradi: o' o‘ o’ oʻ o`.
// Hammasi bitta belgiga keltiriladi, aks holda "O'tirish" va "O‘tirish"
// ikki xil mashq bo'lib qolardi.
const APOSTROPHES = /[ʻʼ‘’`´]/g;

// Mashq nomini taqqoslash kaliti: "  Jim " va "jim" bitta mashq.
export function exerciseKey(name) {
  return String(name ?? "")
    .replace(APOSTROPHES, "'")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// Nom bo'yicha mashqning birligi va mushak guruhini topadi. Manbalar BERILGAN
// TARTIBDA ko'riladi va birinchi topilgani olinadi — chaqiruvchi qaysi manba
// ishonchliroq ekanini o'zi belgilaydi (odatda avval katalog).
// Topilmasa null: "reps"/"other" ni jimgina taxmin qilib qo'ymaymiz.
export function findExerciseMeta(name, ...sources) {
  const key = exerciseKey(name);
  if (!key) return null;
  for (const list of sources) {
    const hit = (list ?? []).find((e) => exerciseKey(e?.name) === key);
    if (hit) {
      return {
        name: String(hit.name).trim(),
        unit: normalizeUnit(hit.unit),
        muscleGroup: normalizeMuscleGroup(hit.muscleGroup),
      };
    }
  }
  return null;
}

// Katalogdan qidirish. Tartib: aniq mos -> boshidan mos -> so'z boshidan mos
// -> o'rtasidan mos; teng bo'lsa alifbo bo'yicha.
export function searchExercises(catalog, query, limit = 8) {
  const q = exerciseKey(query);
  if (!q) return [];
  const scored = [];
  (catalog ?? []).forEach((e) => {
    const key = exerciseKey(e?.name);
    const idx = key.indexOf(q);
    if (!key || idx === -1) return;
    const rank =
      key === q ? 0 : idx === 0 ? 1 : /[\s(-]/.test(key[idx - 1]) ? 2 : 3;
    scored.push({ e, rank });
  });
  return scored
    .sort((a, b) => a.rank - b.rank || a.e.name.localeCompare(b.e.name))
    .slice(0, limit)
    .map((s) => s.e);
}

// Eng so'nggi mashg'ulotlarda bajarilgan mashqlar (eng yangisi birinchi).
// Birlik va guruh imkon bo'lsa katalogdan, bo'lmasa mashg'ulotning o'zidan.
export function recentExercises(workouts, catalog, limit = 6) {
  const seen = new Set();
  const out = [];
  const sorted = [...(workouts ?? [])].sort((a, b) =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
  );
  for (const w of sorted) {
    for (const e of w.exercises ?? []) {
      const key = exerciseKey(e?.name);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(
        findExerciseMeta(e.name, catalog) ?? {
          name: String(e.name).trim(),
          unit: normalizeUnit(e.unit),
          muscleGroup: normalizeMuscleGroup(e.muscleGroup),
        },
      );
      if (out.length >= limit) return out;
    }
  }
  return out;
}

// --- Template ---
// sets: nechta set rejalashtirilgan (1..20), reps: maqsad matni ("8-10",
// "45s"). Ikkalasi ham ixtiyoriy — eski template'larda bo'lmaydi.
export const TEMPLATE_MAX_SETS = 20;
const GOAL_REPS_MAX_LEN = 15;

export function normalizeGoalSets(value) {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n >= 1 && n <= TEMPLATE_MAX_SETS ? n : null;
}

export function normalizeGoalReps(value) {
  return String(value ?? "").trim().slice(0, GOAL_REPS_MAX_LEN);
}

// Hafta kunlari: 0 = DUSH ... 6 = YAK. Takrorsiz, tartiblangan butun sonlar;
// noto'g'ri qiymatlar tashlanadi. Eski template'larda maydon yo'q -> [].
export function normalizeTemplateDays(days) {
  if (!Array.isArray(days)) return [];
  // null/"" ni Number() 0 ga (dushanbaga) aylantirib yuborardi — oldin tashlanadi.
  const valid = days
    .filter((d) => typeof d === "number" || (typeof d === "string" && d.trim() !== ""))
    .map((d) => Number(d))
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
  return Array.from(new Set(valid)).sort((a, b) => a - b);
}

// Shu hafta kuniga biriktirilgan kunlik mashqlar (nomi bo'yicha tartibda).
export function templatesForDay(templates, dayIndex) {
  return (templates ?? [])
    .filter((t) => normalizeTemplateDays(t.days).includes(dayIndex))
    .sort((a, b) => String(a.name).localeCompare(String(b.name)));
}

// id berilsa o'sha template YANGILANADI, berilmasa yangisi yaratiladi.
export function makeTemplate({ id, name, target, days, exercises }) {
  return {
    id: id || uid(),
    name: String(name ?? "").trim(),
    target: String(target ?? "").trim(),
    days: normalizeTemplateDays(days),
    exercises: (exercises ?? [])
      .filter((e) => String(e?.name ?? "").trim())
      .map((e) => ({
        name: String(e.name).trim(),
        unit: normalizeUnit(e.unit),
        muscleGroup: normalizeMuscleGroup(e.muscleGroup),
        sets: normalizeGoalSets(e.sets),
        reps: normalizeGoalReps(e.reps),
      })),
  };
}

// --- Tana o'lchamlari ---
// Forma matn beradi, Firestore'ga raqam yoziladi. To'ldirilmagan maydon
// umuman yozilmaydi (null bilan to'ldirib chiqmaymiz).
export function toStoredMeasurement(entry) {
  const values = {};
  MEASUREMENT_FIELDS.forEach((f) => {
    const n = toNum(entry.values?.[f.key]);
    if (n !== null) values[f.key] = n;
  });
  return { id: entry.id || uid(), date: entry.date, values };
}
