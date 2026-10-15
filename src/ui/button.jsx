import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../utils/cn.js";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
  {
    variants: {
      variant: {
        primary: "bg-brand-accent text-neutral-950 hover:brightness-95",
        secondary:
          "bg-brand-surface2 text-brand-text border border-brand-line hover:border-brand-muted",
        destructive: "bg-transparent text-brand-accent2 hover:brightness-110",
        outline:
          "bg-transparent border border-dashed border-brand-line text-brand-muted hover:text-brand-text",
      },
      size: {
        default: "h-10 px-4 text-sm",
        sm: "h-8 px-3 text-xs",
        icon: "h-8 w-8 p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = "Button";
