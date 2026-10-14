import React from "react";
import { cn } from "../utils/cn.js";

export const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={2}
    className={cn(
      "w-full rounded-md border border-brand-line bg-brand-surface2 px-3 py-2 text-sm text-brand-text resize-none",
      "placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
