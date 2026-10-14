import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  loginWithPhone,
  logout as logoutService,
  registerWithPhone,
  translateAuthError,
  watchAuth,
} from "../services/authService.js";
import { toFullPhone } from "../utils/phone.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [phone, setPhone] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(
    () =>
      watchAuth((u) => {
        setUser(u);
        setAuthLoading(false);
      }),
    [],
  );

  const value = useMemo(() => {
    async function attempt(action, rawPhone, password) {
      // Profil hujjatiga yozish uchun raqamni eslab qolamiz: Firebase'da
      // faqat soxta pochta saqlanadi. Raqam so'rovdan OLDIN qo'yiladi:
      // onAuthStateChanged `await` dan oldin ishlashi mumkin va migratsiya
      // profilni bo'sh telefon bilan yozib qo'yardi (keyin qayta urinmaydi).
      setPhone(toFullPhone(rawPhone));
      try {
        await action(rawPhone, password);
        return { ok: true };
      } catch (e) {
        setPhone("");
        return { ok: false, error: translateAuthError(e.code) };
      }
    }

    return {
      user,
      phone,
      authLoading,
      register: (p, pw) => attempt(registerWithPhone, p, pw),
      login: (p, pw) => attempt(loginWithPhone, p, pw),
      // Keyingi akkaunt oldingisining raqamini "meros" qilib olmasligi uchun.
      logout: async () => {
        await logoutService();
        setPhone("");
      },
    };
  }, [user, phone, authLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth() faqat <AuthProvider> ichida ishlaydi");
  return ctx;
}
