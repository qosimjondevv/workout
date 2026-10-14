import { getDoc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { userDoc } from "./paths.js";
import { SCHEMA_VERSION } from "../constants/schema.js";

// Profil users/{uid} hujjatining O'ZIDA yotadi (subcollection emas).
export function emptyProfile() {
  return {
    schemaVersion: SCHEMA_VERSION,
    displayName: "",
    phone: "",
    height: null,
    startWeight: null,
    goalWeight: null,
    goalType: "maintain",
    restDefaultSeconds: 90,
    progressionStep: 2.5,
  };
}

export function subscribeProfile(uid, onData, onError) {
  return onSnapshot(
    userDoc(uid),
    (snap) => onData(snap.exists() ? { ...emptyProfile(), ...snap.data() } : emptyProfile()),
    onError,
  );
}

export async function readProfile(uid) {
  const snap = await getDoc(userDoc(uid));
  return snap.exists() ? snap.data() : null;
}

export async function saveProfile(uid, patch) {
  await setDoc(
    userDoc(uid),
    { ...patch, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
