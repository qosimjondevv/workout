import React from "react";
import { cn } from "../utils/cn.js";

// Eslatma: to'liq @radix-ui/react-select o'rniga soddalashtirilgan, lekin
// shadcn'ning vizual tilida yozilgan native <select>. Radix versiyasi kerak
// bo'lsa (masalan animatsiyali dropdown), keyingi bosqichda almashtirish oson —
// chunki bu komponentdan foydalanuvchi joylar faqat <Select> importini biladi.
// Kimlar ishlatadi: tahlil/ExerciseChart.jsx, tahlil/MeasurementChart.jsx
export const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-8 rounded-md border border-brand-line bg-brand-surface2 px-2 text-xs text-brand-text",
      "focus:outline-none focus:border-brand-accent",
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
