import { app } from "./firebase.js";
import { COLLECTIONS } from "./paths.js";
import { removeDocument, saveDocument, subscribeCollection } from "./collectionService.js";
import { uid as makeId } from "../utils/id.js";
import { normalizePhotoKind } from "../constants/photoKinds.js";

const NAME = COLLECTIONS.photos;

async function storageModule() {
  return import("firebase/storage");
}

export function subscribePhotos(uid, onData, onError) {
  return subscribeCollection(uid, NAME, onData, onError);
}

const MAX_PHOTO_NOTE = 300;

function photoPath(uid, id) {
  return `users/${uid}/photos/${id}`;
}

export async function uploadProgressPhoto(uid, file, { date, kind, note } = {}) {
  const { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } = await storageModule();

  const id = makeId();
  const storagePath = photoPath(uid, id);
  const fileRef = ref(getStorage(app), storagePath);

  await uploadBytes(fileRef, file, {
    contentType: file.type || "image/jpeg",
    cacheControl: "private, max-age=31536000, immutable",
  });

  try {
    const url = await getDownloadURL(fileRef);
    const doc = {
      id,
      date,
      kind: normalizePhotoKind(kind),
      note: String(note ?? "")
        .trim()
        .slice(0, MAX_PHOTO_NOTE),
      storagePath,
      url,
    };
    await saveDocument(uid, NAME, id, doc);
    return doc;
  } catch (e) {
    await deleteObject(fileRef).catch(() => {});
    throw e;
  }
}

export async function deleteProgressPhoto(uid, id) {
  const { getStorage, ref, deleteObject } = await storageModule();
  try {
    await deleteObject(ref(getStorage(app), photoPath(uid, id)));
  } catch (e) {
    if (e?.code !== "storage/object-not-found") throw e;
  }
  await removeDocument(uid, NAME, id);
}
