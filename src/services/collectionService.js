import { deleteDoc, onSnapshot, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";
import { userCollection, userCollectionDoc } from "./paths.js";
import { db } from "./firebase.js";

export function subscribeCollection(uid, name, onData, onError) {
  return onSnapshot(
    userCollection(uid, name),
    { includeMetadataChanges: true },
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      onData(items, { pending: snap.metadata.hasPendingWrites });
    },
    onError,
  );
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
