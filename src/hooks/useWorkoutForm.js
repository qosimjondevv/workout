import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { todayISO } from "../utils/date.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useWorkouts, useExercises } from "../context/collections.jsx";
import { exerciseKey, findExerciseMeta, makeExerciseDoc } from "../utils/catalog.js";
import {
  blankSet,
  emptyWorkoutForm,
  finalWorkoutDuration,
  fillSetFrom,
  isFilledSet,
  isFormDirty,
  linkWithNext,
  makeExercise,
  normalizeSupersets,
  parseDraft,
  serializeDraft,
  startWorkoutClock,
  stopWorkoutClock,
  toFormSets,
  toFormWorkout,
  unlinkSuperset,
  workoutHasContent,
} from "../utils/workout.js";
import { readStorage, removeStorage, writeStorage } from "../utils/storage.js";

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

  const lastBodyWeight = useMemo(() => {
    const latest = [...workouts]
      .filter((w) => w.bodyWeight != null && Number(w.bodyWeight) > 0)
      .sort((a, b) => (a.date < b.date ? 1 : -1))[0];
    return latest ? String(latest.bodyWeight) : "";
  }, [workouts]);

  const bodyWeightAuto = !form.id && !form.bodyWeightTouched && lastBodyWeight !== "";
  const bodyWeight = bodyWeightAuto ? lastBodyWeight : form.bodyWeight;

  const onDateChange = useCallback((date) => setForm((f) => ({ ...f, date })), []);
  const setTarget = useCallback((target) => setForm((f) => ({ ...f, target })), []);
  const setNotes = useCallback((notes) => setForm((f) => ({ ...f, notes })), []);
  const setBodyWeight = useCallback(
    (value) => setForm((f) => ({ ...f, bodyWeight: value, bodyWeightTouched: true })),
    [],
  );

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
    setForm((f) => ({
      ...f,
      exercises: normalizeSupersets(f.exercises.filter((_, i) => i !== idx)),
    }));
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
      mapExercise(f, exIdx, (e) => ({ ...e, sets: e.sets.filter((_, si) => si !== setIdx) })),
    );
  }, []);

  const toggleSetDone = useCallback((exIdx, setIdx, fallback) => {
    setForm((f) => {
      const ex = f.exercises[exIdx];
      const set = ex?.sets[setIdx];
      if (!set) return f;
      const nextDone = !set.done;
      const filled = nextDone ? fillSetFrom(ex.unit, set, fallback) : set;
      if (nextDone && !isFilledSet(ex.unit, filled)) return f;

      return mapExercise(f, exIdx, (e) => ({
        ...e,
        sets: e.sets.map((s, si) => (si === setIdx ? { ...filled, done: nextDone } : s)),
      }));
    });
  }, []);

  const usePreviousSets = useCallback((exIdx, previousSets) => {
    setForm((f) =>
      mapExercise(f, exIdx, (e) => ({ ...e, sets: toFormSets(e.unit, previousSets) })),
    );
  }, []);

  const applySuggestion = useCallback((exIdx, suggestion) => {
    if (!suggestion) return;
    setForm((f) =>
      mapExercise(f, exIdx, (e) => {
        const value =
          e.unit === "seconds"
            ? { seconds: String(suggestion.seconds) }
            : { weight: String(suggestion.weight), reps: String(suggestion.reps) };
        const emptyIdx = e.sets.findIndex((s) => !isFilledSet(e.unit, s));
        if (emptyIdx === -1) return { ...e, sets: [...e.sets, { ...blankSet(e.unit), ...value }] };
        return {
          ...e,
          sets: e.sets.map((s, si) => (si === emptyIdx ? { ...s, ...value } : s)),
        };
      }),
    );
  }, []);

  const resetForm = useCallback(() => {
    setForm(emptyWorkoutForm(todayISO()));
    setRestored(false);
    setError("");
  }, []);

  const loadIntoForm = useCallback((workout) => {
    setForm(toFormWorkout(workout));
    setRestored(false);
    setError("");
  }, []);

  const dismissRestored = useCallback(() => setRestored(false), []);

  const startClock = useCallback(() => setForm((f) => startWorkoutClock(f, Date.now())), []);
  const stopClock = useCallback(() => setForm((f) => stopWorkoutClock(f, Date.now())), []);

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
      durationSec: finalWorkoutDuration(form, Date.now()),
    });
    syncCatalog(form.exercises);
    resetForm();
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
    startClock,
    stopClock,
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
