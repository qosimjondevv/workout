import React from "react";
import { Badge } from "../../ui/badge.jsx";
import { cn } from "../../utils/cn.js";

export default function TypeBadge({ label, className }) {
  if (!label) return null;
  return (
    <Badge className={cn("text-brand-accent border-brand-accent", className)}>
      {label}
    </Badge>
  );
}
