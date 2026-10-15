import React, { useMemo, useRef, useState } from "react";
import { useExercises, useTemplates, useWorkouts } from "../context/collections.jsx";
import { useWorkoutFormContext } from "../context/WorkoutFormContext.jsx";
import { useRestTimerActions } from "../context/RestTimerContext.jsx";
import { useExerciseInsights } from "../hooks/useExerciseInsights.js";
import { useToast } from "../ui/toast.jsx";
import {
  exerciseKey,
  findExerciseMeta,
  makeExerciseDoc,
  makeTemplate,
  recentExercises,
} from "../utils/catalog.js";
import {
  fillSetFrom,
  formatSet,
  isFilledSet,
  previousSetAt,
  supersetInfo,
} from "../utils/workout.js";
import { formSummary, isRecordSet } from "../utils/metrics.js";
import { vibrate } from "../utils/notify.js";
import { TEMPLATE_PRESETS } from "../constants/templatePresets.js";
import WorkoutForm from "../components/jurnal/WorkoutForm.jsx";
import TemplateBar from "../components/jurnal/TemplateBar.jsx";
import TemplateManager from "../components/jurnal/TemplateManager.jsx";
import SaveBar from "../components/jurnal/SaveBar.jsx";
import LastWorkoutCard from "../components/jurnal/LastWorkoutCard.jsx";
import { DockPortal } from "../layouts/BottomDock.jsx";

const RECENT_LIMIT = 8;

export default function JurnalPage() {
  const wf = useWorkoutFormContext();
  const { form } = wf;
  const { items: workouts } = useWorkouts();
  const { items: catalog, save: saveExercise } = useExercises();
  const {
    items: templates,
    loading: templatesLoading,
    save: saveTemplate,
    remove: removeTemplate,
  } = useTemplates();
  const rest = useRestTimerActions();
  const toast = useToast();

  const [templatesOpen, setTemplatesOpen] = useState(false);
  const announcedRef = useRef(new Map());

  const insights = useExerciseInsights(
    form.exercises.map((e) => e.name),
    form.id,
    form.date,
  );

  const supersets = useMemo(() => supersetInfo(form.exercises), [form.exercises]);

  const recordFlags = useMemo(
    () =>
      form.exercises.map((e) => e.sets.map((s) => isRecordSet(e.unit, s, insights[e.name]?.stats))),
    [form.exercises, insights],
  );

  const recent = useMemo(
    () => recentExercises(workouts, catalog, RECENT_LIMIT),
    [workouts, catalog],
  );

  const summary = useMemo(() => formSummary(form), [form]);

  const lastWorkout = useMemo(
    () =>
      [...workouts].filter((w) => w.id !== form.id).sort((a, b) => (a.date < b.date ? 1 : -1))[0] ??
      null,
    [workouts, form.id],
  );

  function handleToggleDone(exIdx, setIdx) {
    const ex = form.exercises[exIdx];
    const set = ex?.sets[setIdx];
    if (!set) return;

    const insight = insights[ex.name];
    const fallback = previousSetAt(insight?.previous?.exercise?.sets, setIdx);
    const willBeDone = !set.done;
    const filled = willBeDone ? fillSetFrom(ex.unit, set, fallback) : set;
    if (willBeDone && !isFilledSet(ex.unit, filled)) return;

    wf.toggleSetDone(exIdx, setIdx, fallback);
    if (!willBeDone || wf.isEditing) return;

    const group = supersets[exIdx];
    if (!group || group.isLast) rest.start();

    if (isRecordSet(ex.unit, filled, insight?.stats)) announceRecord(ex, filled);
  }

  function announceRecord(ex, set) {
    const value = ex.unit === "seconds" ? Number(set.seconds) : Number(set.weight);
    const key = exerciseKey(ex.name);
    if (value <= (announcedRef.current.get(key) ?? -Infinity)) return;
    announcedRef.current.set(key, value);
    vibrate([60, 40, 60, 40, 120]);
    toast.show({
      tone: "record",
      title: "Yangi rekord!",
      description: `${ex.name} — ${formatSet(ex.unit, set)}`,
    });
  }

  function handleAddExercise(meta) {
    wf.addExerciseToForm(meta.name, meta.unit, undefined, meta.muscleGroup);
  }

  function handleCreateExercise(data) {
    const existing = findExerciseMeta(data.name, catalog);
    if (existing) {
      handleAddExercise(existing);
      return;
    }
    saveExercise(makeExerciseDoc(data));
    handleAddExercise(data);
  }

  function handleStartTemplate(template) {
    wf.addExercises(template.exercises ?? []);
    if (template.target && !form.target.trim()) wf.setTarget(template.target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSaveTemplate(data) {
    saveTemplate(makeTemplate(data));
  }

  function handleAdoptPresets() {
    const known = new Set(catalog.map((e) => exerciseKey(e.name)));
    TEMPLATE_PRESETS.forEach((preset) => {
      saveTemplate(makeTemplate(preset));
      preset.exercises.forEach((e) => {
        const key = exerciseKey(e.name);
        if (known.has(key)) return;
        known.add(key);
        saveExercise(makeExerciseDoc(e));
      });
    });
  }

  function handleSave() {
    const wasEditing = wf.isEditing;
    if (!wf.submit()) return;
    toast.show({
      tone: "success",
      title: wasEditing ? "Yozuv yangilandi" : "Mashg'ulot saqlandi",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const showSaveBar = form.exercises.length > 0 || wf.isEditing;

  return (
    <div>
      <TemplateBar
        templates={templates}
        loading={templatesLoading}
        onStart={handleStartTemplate}
        onManage={() => setTemplatesOpen(true)}
        onAdoptPresets={handleAdoptPresets}
      />

      <WorkoutForm
        wf={wf}
        insights={insights}
        supersets={supersets}
        recordFlags={recordFlags}
        catalog={catalog}
        recent={recent}
        restDefaultSeconds={rest.defaultSeconds}
        onToggleDone={handleToggleDone}
        onStartRest={rest.start}
        onAddExercise={handleAddExercise}
        onCreateExercise={handleCreateExercise}
      />

      <LastWorkoutCard workout={lastWorkout} />

      <TemplateManager
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        templates={templates}
        catalog={catalog}
        currentExercises={form.exercises}
        onSave={handleSaveTemplate}
        onDelete={removeTemplate}
      />

      {showSaveBar && (
        <DockPortal>
          <SaveBar
            summary={summary}
            isEditing={wf.isEditing}
            error={wf.error}
            onSave={handleSave}
          />
        </DockPortal>
      )}
    </div>
  );
}
