import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const SyncContext = createContext(null);

export function SyncProvider({ children }) {
  const [pendingSources, setPendingSources] = useState({});
  const [error, setError] = useState(null);
  const lastFailedRef = useRef(null);

  const setSourcePending = useCallback((name, pending) => {
    setPendingSources((prev) => (prev[name] === pending ? prev : { ...prev, [name]: pending }));
  }, []);

  const run = useCallback(async (operation, message = "Saqlanmadi. Qayta urinib ko'ring.") => {
    try {
      const result = await operation();
      lastFailedRef.current = null;
      setError(null);
      return result;
    } catch (e) {
      console.error(message, e);
      lastFailedRef.current = { operation, message };
      setError(message);
      return null;
    }
  }, []);

  const retry = useCallback(async () => {
    const failed = lastFailedRef.current;
    if (!failed) return;
    setError(null);
    await run(failed.operation, failed.message);
  }, [run]);

  const syncing = Object.values(pendingSources).some(Boolean);

  const value = useMemo(
    () => ({ syncing, error, run, retry, setSourcePending }),
    [syncing, error, run, retry, setSourcePending],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSync() faqat <SyncProvider> ichida ishlaydi");
  return ctx;
}
