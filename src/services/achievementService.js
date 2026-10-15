import { saveDocument, subscribeCollection } from "./collectionService.js";
import { COLLECTIONS } from "./paths.js";

const NAME = COLLECTIONS.achievements;

export function subscribeAchievements(uid, onData, onError) {
  return subscribeCollection(uid, NAME, onData, onError);
}

export function unlockAchievement(uid, { key, silent = false }) {
  return saveDocument(uid, NAME, key, {
    key,
    silent,
    unlockedAt: new Date().toISOString(),
  });
}
