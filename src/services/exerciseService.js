import { removeDocument, saveDocument, subscribeCollection } from "./collectionService.js";
import { COLLECTIONS } from "./paths.js";

const NAME = COLLECTIONS.exercises;

export function subscribeExercises(uid, onData, onError) {
  return subscribeCollection(uid, NAME, onData, onError);
}

export function saveExercise(uid, exercise) {
  return saveDocument(uid, NAME, exercise.id, exercise);
}

export function deleteExercise(uid, id) {
  return removeDocument(uid, NAME, id);
}
