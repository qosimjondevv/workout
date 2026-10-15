import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../../utils/cn.js";

export default function TrendSummary({ trend, unit }) {
  if (!trend || trend.direction === "same") return null;

  const isUp = trend.direction === "up";
  const color = isUp ? "text-brand-accent" : "text-brand-accent2";
  const Icon = isUp ? TrendingUp : TrendingDown;
  const sign = trend.diff > 0 ? "+" : "";

  return (
    <div className={cn("flex items-center gap-1 text-xs font-semibold mb-2", color)}>
      <Icon size={14} />
      <span>
        {sign}
        {trend.diff} {unit}
        {trend.percent !== null && (
          <span className="opacity-80">
            {" "}
            ({sign}
            {trend.percent}%)
          </span>
        )}{" "}
        boshidan beri
      </span>
    </div>
  );
}
