import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { todayISO } from "../utils/date.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useWorkouts, useExercises } from "../context/collections.jsx";
import {
  exerciseKey,
  findExerciseMeta,
  makeExerciseDoc,
} from "../utils/catalog.js";
import {
  blankSet,
  emptyWorkoutForm,
  fillSetFrom,
  isFilledSet,
  isFormDirty,
  linkWithNext,
  makeExercise,
  normalizeSupersets,
  parseDraft,
  serializeDraft,
  syncStartedAt,
  toFormSets,
  toFormWorkout,
  unlinkSuperset,
  workoutDurationSec,
  workoutHasContent,
} from "../utils/workout.js";
import { readStorage, removeStorage, writeStorage } from "../utils/storage.js";

// Joriy mashg'ulot formasi. ILOVA darajasida yashaydi (WorkoutFormContext):
// boshqa tabga o'tib qaytsangiz ham forma joyida turadi.
//
// QORALAMA: forma har o'zgarishda qurilmaga (localStorage) yoziladi. Zalda
// telefon ekrani o'chadi, brauzer sahifani "uxlatib" qayta yuklaydi —
// yarim yozilgan mashg'ulot shunda ham yo'qolmaydi. Kalit foydalanuvchiga
// bog'langan: bitta qurilmada ikki akkaunt bo'lsa qoralamalar aralashmaydi.

const DRAFT_DEBOUNCE_MS = 400;
const draftKey = (uid) => `temir-jurnal:draft:${uid}`;

function initialState(uid) {
  const restored = uid ? parseDraft(readStorage(draftKey(uid))) : null;
  if (restored && isFormDirty(restored)) {
    return {
      form: { ...restored, date: restored.date || todayISO() },
      restored: true,
    };
  }
  return { form: emptyWorkoutForm(todayISO()), restored: false };
}

// Exercises massivining bitta elementini o'zgartirish uchun yordamchi.
function mapExercise(form, exIdx, fn) {
  return {
    ...form,
    exercises: form.exercises.map((e, i) => (i === exIdx ? fn(e) : e)),
  };
}

export function useWorkoutForm() {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const { items: workouts, save: saveWorkout } = useWorkouts();
  const { items: catalog, save: saveExercise } = useExercises();

  const [initial] = useState(() => initialState(uid));
  const [form, setForm] = useState(initial.form);
  const [restored, setRestored] = useState(initial.restored);
  const [error, setError] = useState("");

  // --- Qoralamani yozish ---------------------------------------------------
  const formRef = useRef(form);
  const writeDraft = useCallback(() => {
    if (!uid) return;
    const current = formRef.current;
    if (isFormDirty(current)) writeStorage(draftKey(uid), serializeDraft(current));
    else removeStorage(draftKey(uid));
  }, [uid]);

  useEffect(() => {
    formRef.current = form;
    const id = setTimeout(writeDraft, DRAFT_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [form, writeDraft]);

  // Ilova fonga o'tganda (ekran o'chdi, boshqa ilovaga o'tildi) debounce'ni
  // kutmasdan darhol yozamiz — keyin brauzer sahifani o'ldirishi mumkin.
  useEffect(() => {
    function flush() {
      if (document.visibilityState === "hidden") writeDraft();
    }
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("pagehide", writeDraft);
    return () => {
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("pagehide", writeDraft);
    };
  }, [writeDraft]);

  // --- Tana vazni: oxirgi ma'lum qiymat oldindan qo'yiladi ----------------
  // Bu HOSILAVIY qiymat (effect bilan formaga yozilmaydi): mashg'ulotlar
  // keyinroq yuklansa ham to'g'ri chiqadi. Foydalanuvchi maydonga tegsa,
  // uning qiymati (hatto bo'sh) ustun turadi.
  const lastBodyWeight = useMemo(() => {
    const latest = [...workouts]
      .filter((w) => w.bodyWeight != null && Number(w.bodyWeight) > 0)
      .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    return latest ? String(latest.bodyWeight) : "";
  }, [workouts]);

  const bodyWeightAuto = !form.id && !form.bodyWeightTouched && lastBodyWeight !== "";
  const bodyWeight = bodyWeightAuto ? lastBodyWeight : form.bodyWeight;

  // --- Oddiy maydonlar ----------------------------------------------------
  const onDateChange = useCallback((date) => setForm((f) => ({ ...f, date })), []);
  const setTarget = useCallback((target) => setForm((f) => ({ ...f, target })), []);
  const setNotes = useCallback((notes) => setForm((f) => ({ ...f, notes })), []);
  const setBodyWeight = useCallback(
    (value) => setForm((f) => ({ ...f, bodyWeight: value, bodyWeightTouched: true })),
    [],
  );

  // --- Mashqlar -----------------------------------------------------------
  // Mushak guruhi berilmagan bo'lsa katalogdan olinadi: aks holda mashq
  // "other" bo'lib saqlanib, mushak taqsimoti grafigi buzilardi. Nom ham
  // katalogdagi yozilishiga keltiriladi — "jim" va "Jim" tarixda ikki xil
  // mashq bo'lib qolmasligi uchun (statistika nomni aynan solishtiradi).
  const addExerciseToForm = useCallback(
    (name, unit = "reps", seconds, muscleGroup) => {
      const raw = String(name ?? "").trim();
      if (!raw) return;
      const meta = findExerciseMeta(raw, catalog);
      const n = meta?.name ?? raw;
      setError("");
      setForm((f) => {
        if (f.exercises.some((e) => exerciseKey(e.name) === exerciseKey(n))) return f;
        return {
          ...f,
          exercises: [
            ...f.exercises,
            makeExercise(n, unit, seconds, muscleGroup ?? meta?.muscleGroup),
          ],
        };
      });
    },
    [catalog],
  );

  // Template'dan bir nechta mashqni birdan yuklash. Template'dagi reja
  // (set soni va takror maqsadi) ham olinadi.
  const addExercises = useCallback(
    (list) => {
      setError("");
      setForm((f) => {
        const known = new Set(f.exercises.map((e) => exerciseKey(e.name)));
        const added = [];
        (list ?? []).forEach((e) => {
          const key = exerciseKey(e.name);
          if (!key || known.has(key)) return;
          known.add(key);
          const meta = findExerciseMeta(e.name, catalog);
          added.push(
            makeExercise(
              meta?.name ?? e.name,
              e.unit ?? meta?.unit,
              null,
              e.muscleGroup ?? meta?.muscleGroup,
              { sets: e.sets, reps: e.reps },
            ),
          );
        });
        return added.length ? { ...f, exercises: [...f.exercises, ...added] } : f;
      });
    },
    [catalog],
  );

  const removeExerciseFromForm = useCallback((idx) => {
    setForm((f) =>
      syncStartedAt({
        ...f,
        exercises: normalizeSupersets(f.exercises.filter((_, i) => i !== idx)),
      }),
    );
  }, []);

  const updateExercise = useCallback((exIdx, field, value) => {
    setForm((f) => mapExercise(f, exIdx, (e) => ({ ...e, [field]: value })));
  }, []);

  const linkSuperset = useCallback((exIdx) => {
    setForm((f) => ({ ...f, exercises: linkWithNext(f.exercises, exIdx) }));
  }, []);

  const unlinkFromSuperset = useCallback((exIdx) => {
    setForm((f) => ({ ...f, exercises: unlinkSuperset(f.exercises, exIdx) }));
  }, []);

  // --- Setlar -------------------------------------------------------------
  const updateSet = useCallback((exIdx, setIdx, field, value) => {
    setForm((f) =>
      mapExercise(f, exIdx, (e) => ({
        ...e,
        sets: e.sets.map((s, si) => (si === setIdx ? { ...s, [field]: value } : s)),
      })),
    );
  }, []);

  const addSet = useCallback((exIdx, seconds) => {
    setForm((f) =>
      mapExercise(f, exIdx, (e) => ({ ...e, sets: [...e.sets, blankSet(e.unit, seconds)] })),
    );
  }, []);

  const removeSet = useCallback((exIdx, setIdx) => {
    setForm((f) =>
      syncStartedAt(
        mapExercise(f, exIdx, (e) => ({ ...e, sets: e.sets.filter((_, si) => si !== setIdx) })),
      ),
    );
  }, []);

  // ✓ belgisi. Bo'sh set belgilansa, `fallback` (oldingi mashg'ulotdagi shu
  // tartibdagi set) bilan to'ldiriladi. Birinchi ✓ mashg'ulot sekundomerini
  // ishga tushiradi — lekin eski yozuvni tahrirlashda emas (u allaqachon
  // bo'lib o'tgan, davomiyligi saqlangan).
  const toggleSetDone = useCallback((exIdx, setIdx, fallback) => {
    setForm((f) => {
      const ex = f.exercises[exIdx];
      const set = ex?.sets[setIdx];
      if (!set) return f;
      const nextDone = !set.done;
      const filled = nextDone ? fillSetFrom(ex.unit, set, fallback) : set;
      if (nextDone && !isFilledSet(ex.unit, filled)) return f;

      const next = mapExercise(f, exIdx, (e) => ({
        ...e,
        sets: e.sets.map((s, si) => (si === setIdx ? { ...filled, done: nextDone } : s)),
      }));
      if (nextDone && !f.id && !f.startedAt) next.startedAt = Date.now();
      return syncStartedAt(next);
    });
  }, []);

  // "Use Previous": oldingi mashg'ulotdagi set'larni formaga ko'chiradi.
  // Har set YANGI id oladi, aks holda ikki yozuvda bir xil id'lar bo'lardi.
  const usePreviousSets = useCallback((exIdx, previousSets) => {
    setForm((f) =>
      syncStartedAt(
        mapExercise(f, exIdx, (e) => ({ ...e, sets: toFormSets(e.unit, previousSets) })),
      ),
    );
  }, []);

  // Progressive overload taklifini qabul qilish: birinchi BO'SH set'ga
  // yoziladi, bo'sh set qolmagan bo'lsa yangisi qo'shiladi.
  const applySuggestion = useCallback((exIdx, suggestion) => {
    if (!suggestion) return;
    setForm((f) =>
      mapExercise(f, exIdx, (e) => {
        const value =
          e.unit === "seconds"
            ? { seconds: String(suggestion.seconds) }
            : { weight: String(suggestion.weight), reps: String(suggestion.reps) };
        const emptyIdx = e.sets.findIndex((s) => !isFilledSet(e.unit, s));
        if (emptyIdx === -1)
          return { ...e, sets: [...e.sets, { ...blankSet(e.unit), ...value }] };
        return {
          ...e,
          sets: e.sets.map((s, si) => (si === emptyIdx ? { ...s, ...value } : s)),
        };
      }),
    );
  }, []);

  // --- Butun forma --------------------------------------------------------
  const resetForm = useCallback(() => {
    setForm(emptyWorkoutForm(todayISO()));
    setRestored(false);
    setError("");
  }, []);

  // toFormWorkout chuqur nusxa qaytaradi — tahrirlash ro'yxatdagi yozuvga
  // tegib ketmaydi, "Bekor qilish" haqiqatan ham bekor qiladi.
  const loadIntoForm = useCallback((workout) => {
    setForm(toFormWorkout(workout));
    setRestored(false);
    setError("");
  }, []);

  const dismissRestored = useCallback(() => setRestored(false), []);

  // Katalogda yo'q mashqlarni avtomatik qo'shadi, shunda ular keyingi safar
  // qidiruvda va "so'nggi" ro'yxatida chiqadi.
  function syncCatalog(exercises) {
    const known = new Set(catalog.map((e) => exerciseKey(e.name)));
    exercises.forEach((e) => {
      const key = exerciseKey(e.name);
      if (!key || known.has(key)) return;
      known.add(key);
      saveExercise(makeExerciseDoc({ name: e.name, unit: e.unit, muscleGroup: e.muscleGroup }));
    });
  }

  function submit() {
    if (!form.date) {
      setError("Sanani tanlang");
      return false;
    }
    if (!workoutHasContent(form)) {
      setError("Kamida bitta mashq va uning natijasini kiriting");
      return false;
    }

    setError("");
    saveWorkout({
      ...form,
      bodyWeight,
      durationSec: workoutDurationSec(form.startedAt, Date.now(), form.durationSec),
    });
    syncCatalog(form.exercises);
    resetForm();
    // Qoralama darhol o'chiriladi: debounce kutilsa, shu orada sahifa
    // yopilsa saqlangan mashg'ulot "tiklanadigan qoralama" bo'lib qolardi.
    if (uid) removeStorage(draftKey(uid));
    return true;
  }

  return {
    form,
    error,
    isEditing: Boolean(form.id),
    isDirty: isFormDirty(form),
    restored,
    dismissRestored,
    bodyWeight,
    bodyWeightAuto,
    onDateChange,
    setTarget,
    setBodyWeight,
    setNotes,
    addExerciseToForm,
    addExercises,
    removeExerciseFromForm,
    updateExercise,
    linkSuperset,
    unlinkFromSuperset,
    updateSet,
    addSet,
    removeSet,
    toggleSetDone,
    usePreviousSets,
    applySuggestion,
    resetForm,
    loadIntoForm,
    submit,
  };
}
