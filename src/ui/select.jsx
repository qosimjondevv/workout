import React from "react";
import { cn } from "../utils/cn.js";

export const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-8 rounded-md border border-brand-line bg-brand-surface2 px-2 text-xs text-brand-text",
      "focus:outline-none focus:border-brand-accent",
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";
