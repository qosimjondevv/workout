import { collection, doc } from "firebase/firestore";
import { db } from "./firebase.js";

// Firestore tuzilishi (spetsifikatsiya 14-band):
//
//   users/{uid}                        <- profil hujjati
//   users/{uid}/workouts/{id}
//   users/{uid}/exercises/{id}
//   users/{uid}/measurements/{id}
//   users/{uid}/templates/{id}
//   users/{uid}/achievements/{id}
//   users/{uid}/appData/main           <- ESKI model, zaxira sifatida qoladi
export const COLLECTIONS = {
  workouts: "workouts",
  exercises: "exercises",
  measurements: "measurements",
  templates: "templates",
  achievements: "achievements",
  photos: "photos",
};

export function userDoc(uid) {
  return doc(db, "users", uid);
}

export function userCollection(uid, name) {
  return collection(db, "users", uid, name);
}

export function userCollectionDoc(uid, name, id) {
  return doc(db, "users", uid, name, id);
}

// Eski (v2) bitta hujjatli model — faqat migratsiya o'qiydi.
export function legacyDoc(uid) {
  return doc(db, "users", uid, "appData", "main");
}
