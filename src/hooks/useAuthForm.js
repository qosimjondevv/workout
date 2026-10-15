import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export function useAuthForm() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function toggleMode() {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError("");
  }

  async function submit() {
    setError("");

    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9) {
      setError("Telefon raqamni to'liq kiriting");
      return;
    }
    if (password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
      return;
    }

    setSubmitting(true);
    const result =
      mode === "login" ? await login(phone, password) : await register(phone, password);
    setSubmitting(false);

    if (!result.ok) setError(result.error);
  }

  return {
    mode,
    toggleMode,
    phone,
    setPhone,
    password,
    setPassword,
    error,
    submitting,
    submit,
  };
}
