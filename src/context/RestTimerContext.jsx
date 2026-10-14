import React, { createContext, useContext } from "react";
import { useRestTimer } from "../hooks/useRestTimer.js";
import { useProfile } from "./ProfileContext.jsx";

// Dam olish taymeri ILOVA darajasida turadi, sahifa darajasida emas:
// dam olayotganda Tahlil bo'limiga o'tib ketsangiz ham sanoq to'xtamaydi.
//
// IKKI kontekst: holat (har soniyada o'zgaradi) va amallar (barqaror).
// Taymerni faqat ishga tushiradigan komponent (masalan Jurnal formasi)
// amallar kontekstiga ulanadi va sanoq ketayotganda qayta render bo'lmaydi.
const RestTimerStateContext = createContext(null);
const RestTimerActionsContext = createContext(null);

export function RestTimerProvider({ children }) {
  const { profile } = useProfile();
  const { state, actions } = useRestTimer(
    Number(profile.restDefaultSeconds) || 90,
  );

  return (
    <RestTimerActionsContext.Provider value={actions}>
      <RestTimerStateContext.Provider value={state}>
        {children}
      </RestTimerStateContext.Provider>
    </RestTimerActionsContext.Provider>
  );
}

// { active, remaining, running }
export function useRestTimerState() {
  const ctx = useContext(RestTimerStateContext);
  if (!ctx)
    throw new Error("useRestTimerState() <RestTimerProvider> ichida ishlaydi");
  return ctx;
}

// { start, pause, resume, extend, skip, defaultSeconds }
export function useRestTimerActions() {
  const ctx = useContext(RestTimerActionsContext);
  if (!ctx)
    throw new Error("useRestTimerActions() <RestTimerProvider> ichida ishlaydi");
  return ctx;
}
