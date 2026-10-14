import React from "react";
import { cn } from "../utils/cn.js";

// Yuklanish paytida bo'sh ekran yoki "Hali yozuv yo'q" yozuvi chaqnab
// ketmasligi uchun.
export function Skeleton({ className }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-brand-surface2", className)}
    />
  );
}

export function SkeletonList({ count = 3, className }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-[62px] w-full" />
      ))}
    </div>
  );
}
