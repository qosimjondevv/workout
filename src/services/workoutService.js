import { serverTimestamp } from "firebase/firestore";
import { removeDocument, saveDocument, subscribeCollection } from "./collectionService.js";
import { COLLECTIONS } from "./paths.js";
import { toStoredWorkout } from "../utils/workout.js";
import { workoutVolume } from "../utils/metrics.js";

const NAME = COLLECTIONS.workouts;

export function subscribeWorkouts(uid, onData, onError) {
  return subscribeCollection(uid, NAME, onData, onError);
}

export async function saveWorkout(uid, form) {
  const stored = toStoredWorkout(form);
  const payload = {
    ...stored,
    totalVolume: workoutVolume(stored),
    exerciseCount: stored.exercises.length,
    setCount: stored.exercises.reduce((n, e) => n + e.sets.length, 0),
    ...(form.id ? {} : { createdAt: serverTimestamp() }),
  };
  await saveDocument(uid, NAME, payload.id, payload);
  return payload;
}

export function deleteWorkout(uid, id) {
  return removeDocument(uid, NAME, id);
}
