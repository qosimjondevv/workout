import React from "react";
import { useAuthForm } from "../hooks/useAuthForm.js";
import PhoneAuthForm from "../components/auth/PhoneAuthForm.jsx";

export default function LoginPage() {
  const f = useAuthForm();

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <PhoneAuthForm
        mode={f.mode}
        phone={f.phone}
        password={f.password}
        error={f.error}
        submitting={f.submitting}
        onPhoneChange={f.setPhone}
        onPasswordChange={f.setPassword}
        onSubmit={f.submit}
        onToggleMode={f.toggleMode}
      />
    </div>
  );
}
