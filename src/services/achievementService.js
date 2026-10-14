import { saveDocument, subscribeCollection } from "./collectionService.js";
import { COLLECTIONS } from "./paths.js";

const NAME = COLLECTIONS.achievements;

// Achievement hujjatining ID'si achievement kalitining O'ZI ("first-workout").
// Shu sabab qayta-qayta yozilsa ham dublikat paydo bo'lmaydi.
//
// silent: migratsiyadan keyin bir vaqtda ko'p yutuq ochilsa modal ko'rsatmaslik
// uchun belgi (foydalanuvchini 8 ta oyna bilan ko'mib tashlamaslik uchun).
export function subscribeAchievements(uid, onData, onError) {
  return subscribeCollection(uid, NAME, onData, onError);
}

export function unlockAchievement(uid, { key, value = null, silent = false }) {
  return saveDocument(uid, NAME, key, {
    key,
    value,
    silent,
    unlockedAt: new Date().toISOString(),
  });
}
