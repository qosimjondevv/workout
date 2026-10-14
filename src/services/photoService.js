import { app } from "./firebase.js";
import { COLLECTIONS } from "./paths.js";
import {
  removeDocument,
  saveDocument,
  subscribeCollection,
} from "./collectionService.js";
import { uid as makeId } from "../utils/id.js";
import { normalizePhotoKind } from "../constants/photoKinds.js";

const NAME = COLLECTIONS.photos;

// PROGRESS FOTO ARXITEKTURASI (spetsifikatsiya 7-band).
//
// Rasm faylning O'ZI Firebase Storage'da, metama'lumot Firestore'da yotadi:
//   Storage:   users/{uid}/photos/{photoId}
//   Firestore: users/{uid}/photos/{photoId} -> { date, kind, url, storagePath, note }
//
// firebase/storage ATAYLAB dinamik import qilinadi: suratlar faqat Tahlil ->
// Tana bo'limida kerak, shuning uchun Storage SDK'si asosiy paketga qo'shilib,
// ilovaning birinchi ochilishini sekinlashtirmasligi kerak.

async function storageModule() {
  return import("firebase/storage");
}

export function subscribePhotos(uid, onData, onError) {
  return subscribeCollection(uid, NAME, onData, onError);
}

export const MAX_PHOTO_NOTE = 300; // firestore.rules bilan bir xil

function photoPath(uid, id) {
  return `users/${uid}/photos/${id}`;
}

export async function uploadProgressPhoto(uid, file, { date, kind, note } = {}) {
  const { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } =
    await storageModule();

  const id = makeId();
  const storagePath = photoPath(uid, id);
  const fileRef = ref(getStorage(app), storagePath);

  // Fayl nomi o'zgarmaydi (har surat yangi id oladi), shuning uchun brauzer
  // uni uzoq keshlashi xavfsiz — galereya qayta ochilganda qayta yuklanmaydi.
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
      note: String(note ?? "").trim().slice(0, MAX_PHOTO_NOTE),
      storagePath,
      url,
    };
    await saveDocument(uid, NAME, id, doc);
    return doc;
  } catch (e) {
    // Metama'lumot yozilmasa fayl hech qayerdan ko'rinmaydigan "yetim" bo'lib
    // joy egallab yotardi — uni tozalab, xatoni yuqoriga uzatamiz.
    await deleteObject(fileRef).catch(() => {});
    throw e;
  }
}

// Avval Storage'dagi fayl, keyin Firestore yozuvi o'chiriladi. Teskari
// tartibda qilinsa, fayl "yetim" bo'lib qolib joy egallab yotardi.
// Yo'l id'dan tiklanadi (yuklashdagi bilan bir xil qoida), shuning uchun
// faqat id yetarli.
export async function deleteProgressPhoto(uid, id) {
  const { getStorage, ref, deleteObject } = await storageModule();
  try {
    await deleteObject(ref(getStorage(app), photoPath(uid, id)));
  } catch (e) {
    // Fayl allaqachon yo'q bo'lsa — metama'lumotni tozalab ketamiz.
    // Boshqa xato (internet yo'q va h.k.) bo'lsa to'xtaymiz: aks holda
    // yozuv o'chib, fayl Storage'da yetim qolardi.
    if (e?.code !== "storage/object-not-found") throw e;
  }
  await removeDocument(uid, NAME, id);
}
