import { getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { COLLECTIONS, legacyDoc, userDoc } from "./paths.js";
import { saveManyDocuments } from "./collectionService.js";
import { emptyProfile, readProfile } from "./profileService.js";
import { makeExerciseDoc, toStoredMeasurement } from "../utils/catalog.js";
import { SCHEMA_VERSION } from "../constants/schema.js";
import { toStoredWorkout } from "../utils/workout.js";
import { workoutVolume } from "../utils/metrics.js";
import { toNum } from "../utils/num.js";

function legacyWorkoutToStored(w) {
  const stored = toStoredWorkout(w);
  return {
    ...stored,
    totalVolume: workoutVolume(stored),
    exerciseCount: stored.exercises.length,
    setCount: stored.exercises.reduce((n, e) => n + e.sets.length, 0),
    migratedFrom: "v2",
  };
}

function legacyExercisesToDocs(savedExercises) {
  const seen = new Set();
  const out = [];
  (savedExercises ?? []).forEach((item) => {
    const name = typeof item === "string" ? item.trim() : String(item?.name ?? "").trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(makeExerciseDoc({ name, unit: item?.unit, muscleGroup: null }));
  });
  return out;
}

export async function ensureMigrated(uid, phone) {
  const profile = await readProfile(uid);
  if (toNum(profile?.schemaVersion) >= SCHEMA_VERSION) {
    return { migrated: false, counts: null };
  }

  const legacySnap = await getDoc(legacyDoc(uid));
  const legacy = legacySnap.exists() ? legacySnap.data() : null;

  const counts = { workouts: 0, exercises: 0, measurements: 0 };

  if (legacy) {
    const workouts = (legacy.workouts ?? []).filter((w) => w?.date).map(legacyWorkoutToStored);
    const exercises = legacyExercisesToDocs(legacy.savedExercises);
    const measurements = (legacy.measurements ?? [])
      .filter((m) => m?.date)
      .map(toStoredMeasurement);

    await saveManyDocuments(uid, COLLECTIONS.workouts, workouts);
    await saveManyDocuments(uid, COLLECTIONS.exercises, exercises);
    await saveManyDocuments(uid, COLLECTIONS.measurements, measurements);

    counts.workouts = workouts.length;
    counts.exercises = exercises.length;
    counts.measurements = measurements.length;
  }

  await setDoc(
    userDoc(uid),
    {
      ...emptyProfile(),
      ...(profile ?? {}),
      phone: profile?.phone || phone || "",
      schemaVersion: SCHEMA_VERSION,
      migratedAt: serverTimestamp(),
      createdAt: profile?.createdAt ?? serverTimestamp(),
    },
    { merge: true },
  );

  return { migrated: Boolean(legacy), counts };
}
