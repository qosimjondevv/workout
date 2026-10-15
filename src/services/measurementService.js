import { removeDocument, saveDocument, subscribeCollection } from "./collectionService.js";
import { COLLECTIONS } from "./paths.js";
import { toStoredMeasurement } from "../utils/catalog.js";

const NAME = COLLECTIONS.measurements;

export function subscribeMeasurements(uid, onData, onError) {
  return subscribeCollection(uid, NAME, onData, onError);
}

export function saveMeasurement(uid, entry) {
  const stored = toStoredMeasurement(entry);
  return saveDocument(uid, NAME, stored.id, stored).then(() => stored);
}

export function deleteMeasurement(uid, id) {
  return removeDocument(uid, NAME, id);
}
