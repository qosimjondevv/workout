import React from "react";
import { Phone, Lock } from "lucide-react";
import { Input } from "../../ui/input.jsx";
import { Button } from "../../ui/button.jsx";
import { Card } from "../../ui/card.jsx";
import { cn } from "../../utils/cn.js";

export default function PhoneAuthForm({
  mode,
  phone,
  password,
  error,
  submitting,
  onPhoneChange,
  onPasswordChange,
  onSubmit,
  onToggleMode,
}) {
  return (
    <Card className="w-full max-w-[340px]">
      <div className="font-display text-[22px] font-bold uppercase tracking-wide text-center mb-4">
        Temir <span className="text-brand-accent">Jurnal</span>
      </div>

      <div className="flex gap-1.5 mb-5 bg-brand-surface2 p-1 rounded-md">
        <button
          type="button"
          onClick={() => mode !== "login" && onToggleMode()}
          className={cn(
            "flex-1 py-2 rounded text-sm font-semibold cursor-pointer transition-colors",
            mode === "login"
              ? "bg-brand-accent text-neutral-950"
              : "bg-transparent text-brand-muted",
          )}
        >
          Kirish
        </button>
        <button
          type="button"
          onClick={() => mode !== "register" && onToggleMode()}
          className={cn(
            "flex-1 py-2 rounded text-sm font-semibold cursor-pointer transition-colors",
            mode === "register"
              ? "bg-brand-accent text-neutral-950"
              : "bg-transparent text-brand-muted",
          )}
        >
          Ro'yxatdan o'tish
        </button>
      </div>

      {mode === "register" && (
        <div className="text-xs text-brand-muted text-center mb-4 leading-relaxed">
          Ilk marta kiryapsizmi? Telefon raqam va o'zingiz xohlagan parolni kiriting — akkaunt
          avtomatik yaratiladi.
        </div>
      )}

      <div className="mb-3">
        <label className="text-[11px] text-brand-muted">Telefon raqam</label>
        <div className="relative mt-1">
          <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <Input
            type="tel"
            inputMode="numeric"
            placeholder="90 770 10 73"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="mb-1">
        <label className="text-[11px] text-brand-muted">Parol</label>
        <div className="relative mt-1">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            className="pl-9"
          />
        </div>
        {mode === "register" && (
          <div className="text-[10px] text-brand-muted mt-1">Kamida 6 ta belgi</div>
        )}
      </div>

      {error && <div className="text-brand-accent2 text-xs mt-2">{error}</div>}

      <Button
        onClick={onSubmit}
        disabled={submitting}
        className="w-full mt-4 font-display uppercase tracking-wide text-sm"
      >
        {submitting ? "Kuting..." : mode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
      </Button>
    </Card>
  );
}
