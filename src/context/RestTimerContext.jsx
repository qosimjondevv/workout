import React, { createContext, useContext } from "react";
import { useRestTimer } from "../hooks/useRestTimer.js";
import { useProfile } from "./ProfileContext.jsx";

const RestTimerStateContext = createContext(null);
const RestTimerActionsContext = createContext(null);

export function RestTimerProvider({ children }) {
  const { profile } = useProfile();
  const { state, actions } = useRestTimer(Number(profile.restDefaultSeconds) || 90);

  return (
    <RestTimerActionsContext.Provider value={actions}>
      <RestTimerStateContext.Provider value={state}>{children}</RestTimerStateContext.Provider>
    </RestTimerActionsContext.Provider>
  );
}

export function useRestTimerState() {
  const ctx = useContext(RestTimerStateContext);
  if (!ctx) throw new Error("useRestTimerState() <RestTimerProvider> ichida ishlaydi");
  return ctx;
}

export function useRestTimerActions() {
  const ctx = useContext(RestTimerActionsContext);
  if (!ctx) throw new Error("useRestTimerActions() <RestTimerProvider> ichida ishlaydi");
  return ctx;
}
