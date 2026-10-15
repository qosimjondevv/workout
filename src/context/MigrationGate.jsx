import { useEffect, useState } from "react";
import { ensureMigrated } from "../services/migrationService.js";
import { useAuth } from "./AuthContext.jsx";

export default function MigrationGate({ children, fallback }) {
  const { user, phone } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;

    (async () => {
      try {
        await ensureMigrated(user.uid, phone);
        if (!cancelled) setReady(true);
      } catch (e) {
        console.error("Migratsiya xatosi:", e);
        if (cancelled) return;
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, phone]);

  if (!ready) return fallback ?? null;
  return children;
}
