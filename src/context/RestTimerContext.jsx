import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useRestTimer } from "../hooks/useRestTimer.js";
import { useProfile } from "./ProfileContext.jsx";
import { normalizeRestSeconds } from "../constants/restPresets.js";

const RestTimerStateContext = createContext(null);
const RestTimerActionsContext = createContext(null);

export function RestTimerProvider({ children }) {
  const { profile, update } = useProfile();
  const { state, actions } = useRestTimer(normalizeRestSeconds(profile.restDefaultSeconds));

  const saveDefault = useCallback(
    (seconds) => update({ restDefaultSeconds: normalizeRestSeconds(seconds) }),
    [update],
  );

  const value = useMemo(() => ({ ...actions, saveDefault }), [actions, saveDefault]);

  return (
    <RestTimerActionsContext.Provider value={value}>
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
