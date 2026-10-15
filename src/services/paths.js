import { collection, doc } from "firebase/firestore";
import { db } from "./firebase.js";

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

export function legacyDoc(uid) {
  return doc(db, "users", uid, "appData", "main");
}
