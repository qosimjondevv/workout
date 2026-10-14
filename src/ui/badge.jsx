import React from "react";
import { cn } from "../utils/cn.js";

// Kimlar ishlatadi: TypeBadge.jsx (kun turini ko'rsatish uchun: Tepa / Oyoq / Dam)
export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[5px] border px-1.5 py-0.5 text-[10px] font-bold",
        className
      )}
      {...props}
    />
  );
}
