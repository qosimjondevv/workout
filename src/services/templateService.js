import {
  removeDocument,
  saveDocument,
  subscribeCollection,
} from "./collectionService.js";
import { COLLECTIONS } from "./paths.js";


const NAME = COLLECTIONS.templates;

// Template = tayyor mashqlar to'plami (Push Day, Pull Day, Leg Day).
// Ichida setlar EMAS, faqat mashqlar ro'yxati saqlanadi — natijalar har safar
// yangidan kiritiladi.
export function subscribeTemplates(uid, onData, onError) {
  return subscribeCollection(uid, NAME, onData, onError);
}

export function saveTemplate(uid, template) {
  return saveDocument(uid, NAME, template.id, template);
}

export function deleteTemplate(uid, id) {
  return removeDocument(uid, NAME, id);
}
