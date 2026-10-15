import React, { useState } from "react";
import { LogOut, Save, User } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import {
  useExercises,
  useMeasurements,
  usePhotos,
  useTemplates,
  useWorkouts,
} from "../context/collections.jsx";
import { useAchievementProgress } from "../hooks/useAchievementTracker.js";
import AchievementList from "../components/achievements/AchievementList.jsx";
import ExerciseManager from "../components/jurnal/ExerciseManager.jsx";
import DataExportCard from "../components/profil/DataExportCard.jsx";
import InstallAppCard from "../components/profil/InstallAppCard.jsx";
import { useToast } from "../ui/toast.jsx";
import { exerciseKey, makeExerciseDoc } from "../utils/catalog.js";
import {
  buildBackup,
  exportFileName,
  measurementsCsvRows,
  toCsv,
  workoutsCsvRows,
} from "../utils/export.js";
import { downloadText } from "../utils/download.js";
import { todayISO } from "../utils/date.js";
import { latestBodyWeight } from "../utils/metrics.js";
import { DEFAULT_MUSCLE_GROUP } from "../constants/muscleGroups.js";
import { normalizeRestSeconds } from "../constants/restPresets.js";
import { Card, CardTitle } from "../ui/card.jsx";
import { Input } from "../ui/input.jsx";
import { Button } from "../ui/button.jsx";
import { Select } from "../ui/select.jsx";
import { Skeleton } from "../ui/skeleton.jsx";
import { formatPhoneDisplay } from "../utils/phone.js";
import { toNum, toStr } from "../utils/num.js";

const EMPTY_EXERCISE_DRAFT = {
  name: "",
  unit: "reps",
  muscleGroup: DEFAULT_MUSCLE_GROUP,
};

const GOAL_TYPES = [
  { key: "lose", label: "Vazn tashlash" },
  { key: "maintain", label: "Saqlab turish" },
  { key: "gain", label: "Vazn olish" },
];

function profileToForm(profile) {
  return {
    displayName: profile.displayName ?? "",
    height: toStr(profile.height),
    goalWeight: toStr(profile.goalWeight),
    goalType: profile.goalType ?? "maintain",
    restDefaultSeconds: toStr(normalizeRestSeconds(profile.restDefaultSeconds)),
    progressionStep: toStr(profile.progressionStep ?? 2.5),
  };
}

export default function ProfilPage() {
  const { logout } = useAuth();
  const { profile, loading, update } = useProfile();
  const { items: workouts } = useWorkouts();
  const { items: catalog, save: saveExercise, remove: removeExercise } = useExercises();
  const { items: measurements } = useMeasurements();
  const { items: templates } = useTemplates();
  const { items: photos } = usePhotos();
  const { unlockedKeys, unlocked, stats: achievementStats } = useAchievementProgress();
  const toast = useToast();
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [exerciseDraft, setExerciseDraft] = useState(EMPTY_EXERCISE_DRAFT);

  const form = draft ?? profileToForm(profile);

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-[120px] w-full" />
        <Skeleton className="h-[240px] w-full" />
      </div>
    );
  }

  const set = (key, value) => {
    setDraft((f) => ({ ...(f ?? profileToForm(profile)), [key]: value }));
    setSaved(false);
  };

  function handleSave() {
    update({
      displayName: form.displayName.trim(),
      height: toNum(form.height),
      goalWeight: toNum(form.goalWeight),
      goalType: form.goalType,
      restDefaultSeconds: normalizeRestSeconds(form.restDefaultSeconds),
      progressionStep: toNum(form.progressionStep) ?? 2.5,
    });
    setSaved(true);
  }

  function handleAddToCatalog() {
    const name = exerciseDraft.name.trim();
    if (!name) return;
    const exists = catalog.some((e) => exerciseKey(e.name) === exerciseKey(name));
    if (!exists) saveExercise(makeExerciseDoc({ ...exerciseDraft, name }));
    setExerciseDraft(EMPTY_EXERCISE_DRAFT);
  }

  function exportJson() {
    const backup = buildBackup({
      profile,
      workouts,
      exercises: catalog,
      measurements,
      templates,
      achievements: unlocked,
      photos,
    });
    downloadText(
      exportFileName("zaxira", "json", todayISO()),
      JSON.stringify(backup, null, 2),
      "json",
    );
    toast.show({ tone: "success", title: "Zaxira fayli tayyor" });
  }

  function exportWorkoutsCsv() {
    downloadText(
      exportFileName("mashgulotlar", "csv", todayISO()),
      toCsv(workoutsCsvRows(workouts)),
      "csv",
    );
  }

  function exportMeasurementsCsv() {
    downloadText(
      exportFileName("olchamlar", "csv", todayISO()),
      toCsv(measurementsCsvRows(measurements)),
      "csv",
    );
  }

  const lastWeight = latestBodyWeight(workouts, measurements);

  return (
    <div>
      <Card className="mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-brand-surface2 flex items-center justify-center text-brand-accent">
            <User size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-[15px] uppercase tracking-wide truncate">
              {form.displayName || "Ism kiritilmagan"}
            </div>
            <div className="text-xs text-brand-muted">
              {profile.phone ? formatPhoneDisplay(profile.phone) : "-"}
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 mt-4">
          <div className="flex-1 bg-brand-surface2 rounded-md p-2.5 text-center">
            <div className="text-lg font-display font-bold">{workouts.length}</div>
            <div className="text-[10px] text-brand-muted">Mashg'ulot</div>
          </div>
          <div className="flex-1 bg-brand-surface2 rounded-md p-2.5 text-center">
            <div className="text-lg font-display font-bold">{lastWeight ?? "-"}</div>
            <div className="text-[10px] text-brand-muted">Joriy vazn (kg)</div>
          </div>
          <div className="flex-1 bg-brand-surface2 rounded-md p-2.5 text-center">
            <div className="text-lg font-display font-bold text-brand-accent">
              {form.goalWeight || "-"}
            </div>
            <div className="text-[10px] text-brand-muted">Maqsad (kg)</div>
          </div>
        </div>
      </Card>

      <InstallAppCard />

      <AchievementList unlockedKeys={unlockedKeys} stats={achievementStats} />

      <Card>
        <CardTitle className="mb-3">Sozlamalar</CardTitle>

        <label className="text-[11px] text-brand-muted">Ism</label>
        <Input
          value={form.displayName}
          onChange={(e) => set("displayName", e.target.value)}
          placeholder="Ismingiz"
          className="mt-1 mb-3"
        />

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-[11px] text-brand-muted">Bo'y (sm)</label>
            <Input
              type="number"
              inputMode="decimal"
              value={form.height}
              onChange={(e) => set("height", e.target.value)}
              placeholder="175"
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-[11px] text-brand-muted">Maqsad vazn (kg)</label>
            <Input
              type="number"
              inputMode="decimal"
              value={form.goalWeight}
              onChange={(e) => set("goalWeight", e.target.value)}
              placeholder="75"
              className="mt-1"
            />
          </div>
        </div>

        <label className="text-[11px] text-brand-muted">Maqsad turi</label>
        <div className="mt-1 mb-3">
          <Select
            value={form.goalType}
            onChange={(e) => set("goalType", e.target.value)}
            className="w-full h-10 text-sm"
          >
            {GOAL_TYPES.map((g) => (
              <option key={g.key} value={g.key}>
                {g.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <label className="text-[11px] text-brand-muted">Dam olish (soniya)</label>
            <Input
              type="number"
              inputMode="numeric"
              value={form.restDefaultSeconds}
              onChange={(e) => set("restDefaultSeconds", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-[11px] text-brand-muted">Vazn qadami (kg)</label>
            <Input
              type="number"
              inputMode="decimal"
              value={form.progressionStep}
              onChange={(e) => set("progressionStep", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="w-full font-display uppercase tracking-wide text-sm"
        >
          <Save size={16} /> {saved ? "Saqlandi" : "Saqlash"}
        </Button>
      </Card>

      <div className="mt-4">
        <ExerciseManager
          open={catalogOpen}
          onToggle={() => setCatalogOpen((o) => !o)}
          items={catalog}
          draft={exerciseDraft}
          onDraftChange={setExerciseDraft}
          onAdd={handleAddToCatalog}
          onRemove={removeExercise}
        />
      </div>

      <DataExportCard
        counts={{
          workouts: workouts.length,
          measurements: measurements.length,
          templates: templates.length,
        }}
        onExportJson={exportJson}
        onExportWorkoutsCsv={exportWorkoutsCsv}
        onExportMeasurementsCsv={exportMeasurementsCsv}
      />

      <Button variant="secondary" onClick={logout} className="w-full mb-2">
        <LogOut size={15} /> Akkauntdan chiqish
      </Button>
    </div>
  );
}
