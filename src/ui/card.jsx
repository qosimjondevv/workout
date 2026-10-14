import React from "react";
import { cn } from "../utils/cn.js";

// Kimlar ishlatadi: har bir tabdagi asosiy "panel" bloklar (forma, tarix, statistika, grafik)
export function Card({ className, ...props }) {
  return <div className={cn("bg-brand-surface rounded-lg p-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return (
    <div
      className={cn("font-display text-[15px] uppercase tracking-wide text-brand-text", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("flex items-center justify-between mb-3", className)} {...props} />;
}
