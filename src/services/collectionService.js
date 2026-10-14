import {
  deleteDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { userCollection, userCollectionDoc } from "./paths.js";
import { db } from "./firebase.js";

// Har kolleksiya bir xil ishlagani uchun CRUD bir marta yoziladi.
// Domen servislari (workoutService va h.k.) shu ustiga quriladi.

// Real vaqt obunasi. Offline kesh bilan birga ishlaganda birinchi javob
// darhol keshdan keladi, keyin server versiyasi ustiga tushadi.
// hasPendingWrites -> hali serverga yetmagan yozuvlar bor (sinxronlanmoqda).
export function subscribeCollection(uid, name, onData, onError) {
  return onSnapshot(
    userCollection(uid, name),
    { includeMetadataChanges: true },
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onData(items, {
        pending: snap.metadata.hasPendingWrites,
        fromCache: snap.metadata.fromCache,
      });
    },
    onError,
  );
}

export async function fetchCollection(uid, name) {
  const snap = await getDocs(userCollection(uid, name));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function saveDocument(uid, name, id, data) {
  await setDoc(
    userCollectionDoc(uid, name, id),
    { ...data, id, updatedAt: serverTimestamp() },
    { merge: true },
  );
}

export async function removeDocument(uid, name, id) {
  await deleteDoc(userCollectionDoc(uid, name, id));
}

// Firestore bitta batch'da 500 tagacha amalni qabul qiladi.
const BATCH_LIMIT = 450;

export async function saveManyDocuments(uid, name, items) {
  for (let i = 0; i < items.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    items.slice(i, i + BATCH_LIMIT).forEach((item) => {
      batch.set(userCollectionDoc(uid, name, item.id), item, { merge: true });
    });
    await batch.commit();
  }
}
