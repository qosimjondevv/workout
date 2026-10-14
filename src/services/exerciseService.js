import {
  removeDocument,
  saveDocument,
  subscribeCollection,
} from "./collectionService.js";
import { COLLECTIONS } from "./paths.js";
import { makeExerciseDoc } from "../utils/catalog.js";

const NAME = COLLECTIONS.exercises;

// Mashqlar KATALOGI: nomi, birligi, mushak guruhi. Mashg'ulot ichidagi
// nusxadan alohida turadi, chunki katalog taklif ro'yxati va template'lar
// uchun kerak.
export function subscribeExercises(uid, onData, onError) {
  return subscribeCollection(uid, NAME, onData, onError);
}

export function saveExercise(uid, exercise) {
  return saveDocument(uid, NAME, exercise.id, exercise);
}

export function deleteExercise(uid, id) {
  return removeDocument(uid, NAME, id);
}

// Mashg'ulot saqlanganda katalogda yo'q mashqlarni avtomatik qo'shadi.
export async function ensureExercisesExist(uid, existing, exercises) {
  const known = new Set(existing.map((e) => e.name.toLowerCase()));
  const missing = [];
  exercises.forEach((e) => {
    const key = e.name.toLowerCase();
    if (!key || known.has(key)) return;
    known.add(key);
    missing.push(makeExerciseDoc(e));
  });
  await Promise.all(missing.map((e) => saveExercise(uid, e)));
  return missing;
}
