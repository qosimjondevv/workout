import React from "react";
import { cn } from "../utils/cn.js";

// Kimlar ishlatadi: WorkoutForm, ExerciseListEditor, MeasurementForm, PhoneAuthForm
export const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full h-10 rounded-md border border-brand-line bg-brand-surface2 px-3 text-sm text-brand-text",
      "placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
