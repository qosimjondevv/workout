import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useCountdownTimer(onFinish) {
  const [duration, setDuration] = useState(null);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);

  const deadlineRef = useRef(0);
  const remainingRef = useRef(0);
  const durationRef = useRef(null);
  const runningRef = useRef(false);
  const finishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  const secondsLeft = useCallback(
    () => Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000)),
    [],
  );

  const setRunningBoth = useCallback((value) => {
    runningRef.current = value;
    setRunning(value);
  }, []);

  useEffect(() => {
    if (!running) return undefined;

    function tick() {
      const left = secondsLeft();
      remainingRef.current = left;
      setRemaining(left);
      if (left === 0) {
        setRunningBoth(false);
        if (!finishedRef.current) {
          finishedRef.current = true;
          onFinishRef.current?.(durationRef.current);
        }
      }
    }

    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [running, secondsLeft, setRunningBoth]);

  const start = useCallback(
    (seconds) => {
      finishedRef.current = false;
      durationRef.current = seconds;
      deadlineRef.current = Date.now() + seconds * 1000;
      remainingRef.current = seconds;
      setDuration(seconds);
      setRemaining(seconds);
      setRunningBoth(true);
    },
    [setRunningBoth],
  );

  const pause = useCallback(() => {
    if (!runningRef.current) return;
    const left = secondsLeft();
    remainingRef.current = left;
    setRemaining(left);
    setRunningBoth(false);
  }, [secondsLeft, setRunningBoth]);

  const resume = useCallback(() => {
    if (runningRef.current || remainingRef.current <= 0) return;
    deadlineRef.current = Date.now() + remainingRef.current * 1000;
    setRunningBoth(true);
  }, [setRunningBoth]);

  const extend = useCallback(
    (seconds) => {
      if (durationRef.current === null) return;
      finishedRef.current = false;
      durationRef.current += seconds;
      setDuration(durationRef.current);

      if (runningRef.current) {
        deadlineRef.current += seconds * 1000;
        remainingRef.current = secondsLeft();
      } else {
        remainingRef.current += seconds;
        deadlineRef.current = Date.now() + remainingRef.current * 1000;
        setRunningBoth(true);
      }
      setRemaining(remainingRef.current);
    },
    [secondsLeft, setRunningBoth],
  );

  const reset = useCallback(() => {
    finishedRef.current = false;
    durationRef.current = null;
    deadlineRef.current = 0;
    remainingRef.current = 0;
    setDuration(null);
    setRemaining(0);
    setRunningBoth(false);
  }, [setRunningBoth]);

  return useMemo(
    () => ({ duration, remaining, running, start, pause, resume, extend, reset }),
    [duration, remaining, running, start, pause, resume, extend, reset],
  );
}
