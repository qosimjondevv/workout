import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  emptyProfile,
  saveProfile,
  subscribeProfile,
} from "../services/profileService.js";
import { useAuth } from "./AuthContext.jsx";
import { useSync } from "./SyncContext.jsx";

const ProfileContext = createContext(null);

// Profil kolleksiya emas, users/{uid} hujjatining o'zi — shuning uchun
// umumiy fabrikadan foydalanmaydi. Holat uid bilan birga saqlanadi, ya'ni
// effect ichida setState chaqirilmaydi (useCollectionStore bilan bir xil usul).
export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const { run } = useSync();
  const uid = user?.uid ?? null;

  const [state, setState] = useState({ uid: null, profile: null });

  useEffect(() => {
    if (!uid) return undefined;
    return subscribeProfile(
      uid,
      (data) => setState({ uid, profile: data }),
      (e) => {
        console.error("Profilni o'qishda xato:", e);
        setState({ uid, profile: emptyProfile() });
      },
    );
  }, [uid]);

  const update = useCallback(
    (patch) => {
      if (!uid) return null;
      return run(() => saveProfile(uid, patch), "Profil saqlanmadi.");
    },
    [uid, run],
  );

  const matches = state.uid === uid && state.profile !== null;

  const value = useMemo(
    () => ({
      profile: matches ? state.profile : emptyProfile(),
      loading: Boolean(uid) && !matches,
      update,
    }),
    [matches, state.profile, uid, update],
  );

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx)
    throw new Error("useProfile() faqat <ProfileProvider> ichida ishlaydi");
  return ctx;
}
