import { useEffect, useState } from "react";
import { ensureMigrated } from "../services/migrationService.js";
import { useAuth } from "./AuthContext.jsx";

// Ma'lumot bilan ishlaydigan hech narsa migratsiya tugamaguncha ko'rsatilmaydi:
// aks holda foydalanuvchi bir zumda BO'SH tarixni ko'rib qo'rqib ketardi.
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
        // Migratsiya o'tmasa ham ilovani bloklamaymiz: eski hujjat joyida
        // turibdi, keyingi kirishda qayta urinib ko'riladi.
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
