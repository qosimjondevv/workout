import { uid } from "./id.js";
import { toNum, toStr } from "./num.js";
import { normalizeMuscleGroup } from "../constants/muscleGroups.js";

// IKKI XIL SHAKL BOR — ularni aralashtirmaslik muhim:
//
//   FORMA shakli  -> barcha qiymatlar MATN ("60", ""), chunki <input> shunday beradi
//   SAQLASH shakli -> barcha qiymatlar RAQAM yoki null, chunki Volume/1RM hisoblanadi
//
// toStoredWorkout() forma -> saqlash, toFormWorkout() saqlash -> forma.
//
// Faqat FORMAGA tegishli maydonlar (Firestore'ga yozilmaydi):
//   set.done            — "bajarildi" belgisi (✓)
//   exercise.goalSets   — template'dagi rejalashtirilgan set soni
//   exercise.goalReps   — template'dagi maqsad ("8-10")
//   form.startedAt      — mashg'ulot boshlangan vaqt (ms), davomiylik uchun
//   form.bodyWeightTouched — vazn maydoniga foydalanuvchi tekkanmi

export function normalizeUnit(unit) {
  return unit === "seconds" ? "seconds" : "reps";
}

// --- FORMA tomoni -----------------------------------------------------------

export function blankSet(unit, seconds) {
  if (normalizeUnit(unit) === "seconds") {
    return {
      id: uid(),
      seconds: seconds != null ? String(seconds) : "",
      done: false,
    };
  }
  return { id: uid(), weight: "", reps: "", done: false };
}

// Set "to'ldirilgan" hisoblanadimi? Matn ham, raqam ham tushunarli bo'lishi
// uchun toNum orqali tekshiriladi.
export function isFilledSet(unit, set) {
  if (!set) return false;
  if (normalizeUnit(unit) === "seconds") return toNum(set.seconds) !== null;
  return toNum(set.weight) !== null || toNum(set.reps) !== null;
}

function goalSetsOf(value) {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n >= 1 && n <= 20 ? n : null;
}

// goal: { sets, reps } — template'dan kelganda. sets nechta bo'sh set
// tayyorlanishini, reps esa input'dagi maqsad matnini belgilaydi.
export function makeExercise(name, unit, seconds, muscleGroup, goal) {
  const u = normalizeUnit(unit);
  const goalSets = goalSetsOf(goal?.sets);
  const count = seconds != null ? 1 : (goalSets ?? 1);
  return {
    id: uid(),
    name: String(name ?? "").trim(),
    unit: u,
    muscleGroup: normalizeMuscleGroup(muscleGroup),
    note: "",
    supersetId: null,
    goalSets,
    goalReps: String(goal?.reps ?? "").trim(),
    sets: Array.from({ length: count }, () => blankSet(u, seconds)),
  };
}

export function emptyWorkoutForm(dateISO) {
  return {
    id: null,
    date: dateISO,
    target: "",
    bodyWeight: "",
    bodyWeightTouched: false,
    notes: "",
    startedAt: null,
    durationSec: null,
    exercises: [],
  };
}

// Firestore'dagi yozuvni formaga yuklash uchun. TO'LIQ YANGI NUSXA qaytaradi —
// tahrirlash global holatga tegib ketmaydi. Saqlangan set'lar haqiqatan
// bajarilgan, shuning uchun done: true.
export function toFormWorkout(stored) {
  const exercises = Array.isArray(stored?.exercises) ? stored.exercises : [];
  return {
    id: stored?.id ?? null,
    date: stored?.date ?? "",
    target: stored?.target ?? "",
    bodyWeight: toStr(stored?.bodyWeight),
    bodyWeightTouched: true,
    notes: stored?.notes ?? "",
    startedAt: null,
    durationSec: positiveInt(stored?.durationSec),
    exercises: normalizeSupersets(
      exercises.map((e) => {
        const unit = normalizeUnit(e?.unit);
        const sets = Array.isArray(e?.sets) ? e.sets : [];
        return {
          id: e?.id || uid(),
          name: String(e?.name ?? ""),
          unit,
          muscleGroup: normalizeMuscleGroup(e?.muscleGroup),
          note: e?.note ?? "",
          supersetId: e?.supersetId || null,
          goalSets: null,
          goalReps: "",
          sets: sets.map((s) =>
            unit === "seconds"
              ? { id: s?.id || uid(), seconds: toStr(s?.seconds), done: true }
              : {
                  id: s?.id || uid(),
                  weight: toStr(s?.weight),
                  reps: toStr(s?.reps),
                  done: true,
                },
          ),
        };
      }),
    ),
  };
}

function positiveInt(value) {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Formadan Firestore shakliga. Bo'sh set'lar va bo'sh mashqlar tashlanadi.
export function toStoredWorkout(form) {
  const exercises = (form.exercises ?? [])
    .map((e) => {
      const unit = normalizeUnit(e.unit);
      const sets = (e.sets ?? [])
        .filter((s) => isFilledSet(unit, s))
        .map((s) =>
          unit === "seconds"
            ? { id: s.id || uid(), seconds: toNum(s.seconds) }
            : {
                id: s.id || uid(),
                weight: toNum(s.weight),
                reps: toNum(s.reps),
              },
        );
      return {
        id: e.id || uid(),
        name: String(e.name ?? "").trim(),
        unit,
        muscleGroup: normalizeMuscleGroup(e.muscleGroup),
        note: e.note ?? "",
        supersetId: e.supersetId || null,
        sets,
      };
    })
    .filter((e) => e.sets.length > 0 && e.name !== "");

  return {
    id: form.id || uid(),
    date: form.date,
    target: String(form.target ?? "").trim(),
    bodyWeight: toNum(form.bodyWeight),
    notes: String(form.notes ?? "").trim(),
    durationSec: positiveInt(form.durationSec),
    // Bo'sh mashqlar tashlangach superset juftligi buzilishi mumkin.
    exercises: normalizeSupersets(exercises),
  };
}

export function workoutHasContent(form) {
  return (form.exercises ?? []).some((e) =>
    (e.sets ?? []).some((s) => isFilledSet(e.unit, s)),
  );
}

// Formada yo'qotishga achinarli biror narsa bormi? (qoralama va
// "joriy formani almashtiraymi?" savoli uchun)
export function isFormDirty(form) {
  if (!form) return false;
  return (
    (form.exercises ?? []).length > 0 ||
    String(form.target ?? "").trim() !== "" ||
    String(form.notes ?? "").trim() !== "" ||
    (Boolean(form.bodyWeightTouched) && String(form.bodyWeight ?? "") !== "")
  );
}

// Tarixda set'ni matn qilib ko'rsatish. Chala "60kg×" chiqmasligi uchun
// alohida hollar tekshiriladi.
export function formatSet(unit, set) {
  if (normalizeUnit(unit) === "seconds") return `${toNum(set?.seconds) ?? 0}s`;
  const w = toNum(set?.weight);
  const r = toNum(set?.reps);
  if (w !== null && r !== null) return `${w}kg×${r}`;
  if (w !== null) return `${w}kg`;
  if (r !== null) return `${r} marta`;
  return "-";
}

// Saqlangan (raqamli) set'larni formaga (matnli) ko'chiradi.
// "Use Previous" tugmasi shu orqali ishlaydi: har set YANGI id oladi, aks holda
// ikki mashg'ulotda bir xil id'li set'lar paydo bo'lardi.
export function toFormSets(unit, sets) {
  const u = normalizeUnit(unit);
  return (sets ?? []).map((s) =>
    u === "seconds"
      ? { id: uid(), seconds: toStr(s?.seconds), done: false }
      : { id: uid(), weight: toStr(s?.weight), reps: toStr(s?.reps), done: false },
  );
}

// Oldingi mashg'ulotdagi set: avval aynan shu tartibdagisi, u bo'lmasa
// oxirgisi (bugun o'tgan safardan ko'proq set qilinayotgan bo'lsa).
export function previousSetAt(prevSets, idx) {
  if (!prevSets?.length) return null;
  return prevSets[idx] ?? prevSets[prevSets.length - 1];
}

// ✓ bosilganda bo'sh set "tavsiya" qiymat bilan to'ldiriladi (odatda oldingi
// mashg'ulotning shu tartibdagi seti). To'ldirilgan maydonlarga tegilmaydi.
export function fillSetFrom(unit, set, fallback) {
  if (!fallback) return set;
  if (normalizeUnit(unit) === "seconds") {
    return toNum(set.seconds) === null && toNum(fallback.seconds) !== null
      ? { ...set, seconds: toStr(fallback.seconds) }
      : set;
  }
  const next = { ...set };
  if (toNum(set.weight) === null && toNum(fallback.weight) !== null)
    next.weight = toStr(fallback.weight);
  if (toNum(set.reps) === null && toNum(fallback.reps) !== null)
    next.reps = toStr(fallback.reps);
  return next;
}

// --- SUPERSET ---------------------------------------------------------------
// Superset = ketma-ket turgan, bir xil supersetId'li mashqlar (kamida 2 ta).
// Mashq o'chirilganda yoki bo'sh mashq tashlanganda guruh buzilishi mumkin,
// shuning uchun har o'zgarishdan keyin normalizeSupersets ishlatiladi:
//   - yolg'iz qolgan mashqdan belgi olinadi;
//   - bir id ikki joyda (ajralgan holda) uchrasa, ikkinchi bo'lak yangi id oladi.

export function normalizeSupersets(exercises) {
  const list = exercises ?? [];
  const out = list.slice();
  const usedIds = new Set();
  let i = 0;
  while (i < list.length) {
    const id = list[i]?.supersetId || null;
    let j = i + 1;
    if (id) while (j < list.length && list[j]?.supersetId === id) j += 1;
    const size = j - i;

    if (id && size < 2) {
      out[i] = { ...list[i], supersetId: null };
    } else if (id && usedIds.has(id)) {
      const fresh = uid();
      for (let k = i; k < j; k += 1) out[k] = { ...list[k], supersetId: fresh };
      usedIds.add(fresh);
    } else if (id) {
      usedIds.add(id);
    }
    i = j;
  }
  return out;
}

// Har mashq uchun superset ma'lumoti yoki null:
//   { label: "A1", letter: "A", position: 1, size: 2, isFirst, isLast }
export function supersetInfo(exercises) {
  const list = exercises ?? [];
  const info = new Array(list.length).fill(null);
  let group = 0;
  let i = 0;
  while (i < list.length) {
    const id = list[i]?.supersetId || null;
    let j = i + 1;
    if (id) while (j < list.length && list[j]?.supersetId === id) j += 1;
    const size = j - i;
    if (id && size >= 2) {
      const letter = String.fromCharCode(65 + (group % 26));
      for (let k = i; k < j; k += 1) {
        const position = k - i + 1;
        info[k] = {
          label: `${letter}${position}`,
          letter,
          position,
          size,
          isFirst: k === i,
          isLast: k === j - 1,
        };
      }
      group += 1;
    }
    i = j;
  }
  return info;
}

// idx dagi mashqni KEYINGISI bilan bitta supersetga qo'shadi. Keyingisi
// allaqachon guruhda bo'lsa, butun o'sha guruh birlashadi.
export function linkWithNext(exercises, idx) {
  const list = exercises ?? [];
  if (idx < 0 || idx >= list.length - 1) return list;
  const id = list[idx].supersetId || list[idx + 1].supersetId || uid();
  const nextId = list[idx + 1].supersetId;
  const out = list.map((e, i) => {
    if (i === idx || i === idx + 1) return { ...e, supersetId: id };
    if (nextId && i > idx + 1 && e.supersetId === nextId)
      return { ...e, supersetId: id };
    return e;
  });
  return normalizeSupersets(out);
}

export function unlinkSuperset(exercises, idx) {
  const list = exercises ?? [];
  if (!list[idx]?.supersetId) return list;
  return normalizeSupersets(
    list.map((e, i) => (i === idx ? { ...e, supersetId: null } : e)),
  );
}

// --- DAVOMIYLIK -------------------------------------------------------------
// 5 soatdan uzun "mashg'ulot" — deyarli har doim ochiq qolib ketgan qoralama.
// Bunday qiymat statistikani buzmasligi uchun saqlanmaydi.
export const MAX_WORKOUT_SECONDS = 5 * 60 * 60;

export function workoutDurationSec(startedAt, now, fallback = null) {
  const start = Number(startedAt);
  if (!startedAt || !Number.isFinite(start)) return fallback ?? null;
  const sec = Math.round((now - start) / 1000);
  if (sec <= 0 || sec > MAX_WORKOUT_SECONDS) return fallback ?? null;
  return sec;
}

// Sekundomer faqat kamida bitta ✓ bor ekan yuradi. Oxirgi bajarilgan set
// (yoki uning mashqi) olib tashlansa, boshlanish vaqti ham tozalanadi —
// aks holda bo'sh formada "2:20:42" kabi soxta vaqt sanalib turardi.
export function syncStartedAt(form) {
  if (!form?.startedAt) return form;
  const anyDone = (form.exercises ?? []).some((e) => (e.sets ?? []).some((s) => s.done));
  return anyDone ? form : { ...form, startedAt: null };
}

// --- QORALAMA (localStorage) ------------------------------------------------
// Saqlangan matn ESKI versiyadan, boshqa qurilmadan yoki qo'lda buzilgan
// bo'lishi mumkin — shuning uchun har maydon qayta tekshiriladi va forma
// hech qachon "yarim" holatda tiklanmaydi.
const DRAFT_VERSION = 1;

export function serializeDraft(form, savedAt = Date.now()) {
  return JSON.stringify({ v: DRAFT_VERSION, savedAt, form });
}

export function parseDraft(text) {
  if (!text) return null;
  try {
    const data = JSON.parse(text);
    if (!data || data.v !== DRAFT_VERSION) return null;
    return sanitizeFormWorkout(data.form);
  } catch {
    return null;
  }
}

function text(value) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

export function sanitizeFormWorkout(raw) {
  if (!raw || typeof raw !== "object") return null;
  const exercises = (Array.isArray(raw.exercises) ? raw.exercises : [])
    .filter((e) => e && text(e.name).trim())
    .map((e) => {
      const unit = normalizeUnit(e.unit);
      const sets = (Array.isArray(e.sets) ? e.sets : [])
        .filter((s) => s && typeof s === "object")
        .map((s) =>
          unit === "seconds"
            ? { id: text(s.id) || uid(), seconds: text(s.seconds), done: s.done === true }
            : {
                id: text(s.id) || uid(),
                weight: text(s.weight),
                reps: text(s.reps),
                done: s.done === true,
              },
        );
      return {
        id: text(e.id) || uid(),
        name: text(e.name),
        unit,
        muscleGroup: normalizeMuscleGroup(e.muscleGroup),
        note: text(e.note),
        supersetId: typeof e.supersetId === "string" && e.supersetId ? e.supersetId : null,
        goalSets: goalSetsOf(e.goalSets),
        goalReps: text(e.goalReps),
        sets,
      };
    });

  const started = Number(raw.startedAt);
  return syncStartedAt({
    id: typeof raw.id === "string" && raw.id ? raw.id : null,
    date: /^\d{4}-\d{2}-\d{2}$/.test(text(raw.date)) ? raw.date : "",
    target: text(raw.target),
    bodyWeight: text(raw.bodyWeight),
    bodyWeightTouched: raw.bodyWeightTouched === true,
    notes: text(raw.notes),
    startedAt: raw.startedAt && Number.isFinite(started) && started > 0 ? started : null,
    durationSec: positiveInt(raw.durationSec),
    exercises: normalizeSupersets(exercises),
  });
}
