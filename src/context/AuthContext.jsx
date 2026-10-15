import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
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
