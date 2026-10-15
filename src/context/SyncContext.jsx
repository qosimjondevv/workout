import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const SyncContext = createContext(null);

// Butun ilova bo'yicha saqlash holati (spetsifikatsiya 17-band).
//
// "syncing" Firestore'ning O'Z signaliga tayanadi: snapshot.hasPendingWrites
// hali serverga yetmagan mahalliy yozuv borligini bildiradi. Offline'da bu
// uzoq cho'zilishi mumkin va bu XATO emas — ma'lumot qurilmada saqlangan.
export function SyncProvider({ children }) {
  const [pendingSources, setPendingSources] = useState({});
  const [error, setError] = useState(null);
  const lastFailedRef = useRef(null);

  const setSourcePending = useCallback((name, pending) => {
    setPendingSources((prev) =>
      prev[name] === pending ? prev : { ...prev, [name]: pending },
    );
  }, []);

  // Har yozuv shu orqali o'tadi: xato bo'lsa xabar ko'rsatiladi va amalning
  // o'zi "Qayta urinish" uchun eslab qolinadi.
  const run = useCallback(
    async (operation, message = "Saqlanmadi. Qayta urinib ko'ring.") => {
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
    },
    [],
  );

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
