import { useCallback, useMemo } from "react";
import { useCountdownTimer } from "./useCountdownTimer.js";
import { beep, requestNotificationPermission, showNotification, vibrate } from "../utils/notify.js";

export function useRestTimer(defaultSeconds = 90) {
  const timer = useCountdownTimer(() => {
    beep();
    vibrate();
    showNotification("Dam olish tugadi", "Keyingi setga tayyormisiz?");
  });
  const { start: startTimer, pause, resume, extend, reset } = timer;

  const start = useCallback(
    (seconds) => {
      requestNotificationPermission();
      startTimer(seconds ?? defaultSeconds);
    },
    [startTimer, defaultSeconds],
  );

  const state = useMemo(
    () => ({
      active: timer.duration !== null,
      remaining: timer.remaining,
      running: timer.running,
    }),
    [timer.duration, timer.remaining, timer.running],
  );

  const actions = useMemo(
    () => ({ start, pause, resume, extend, skip: reset, defaultSeconds }),
    [start, pause, resume, extend, reset, defaultSeconds],
  );

  return { state, actions };
}
