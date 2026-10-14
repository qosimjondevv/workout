import React from "react";
import { Dumbbell, CalendarDays, Flame, Trophy, Layers, Award } from "lucide-react";
import { formatCompact } from "../../utils/num.js";

function Tile({ icon: Icon, value, label, accent }) {
  return (
    <div className="bg-brand-surface rounded-md p-3 text-center">
      <div
        className={
          "flex items-center justify-center gap-1 text-xl font-display font-bold " +
          (accent ? "text-brand-accent" : "text-brand-text")
        }
      >
        <Icon size={14} className={accent ? "" : "text-brand-muted"} />
        {value}
      </div>
      <div className="text-[10px] text-brand-muted mt-0.5 leading-tight">
        {label}
      </div>
    </div>
  );
}

// Spetsifikatsiya 6-band: Total / Last 7 / Streak / Longest / Volume / PR count
export default function DashboardStats({ stats, prCount }) {
  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      <Tile icon={Dumbbell} value={stats.total} label="Jami mashg'ulot" />
      <Tile icon={CalendarDays} value={stats.last7} label="So'nggi 7 kun" />
      <Tile
        icon={Flame}
        value={stats.currentStreak}
        label="Joriy seriya"
        accent={stats.currentStreak > 0}
      />
      <Tile icon={Trophy} value={stats.longestStreak} label="Eng uzun seriya" />
      <Tile
        icon={Layers}
        value={formatCompact(stats.totalVolume)}
        label="Umumiy hajm (kg)"
      />
      <Tile
        icon={Award}
        value={prCount}
        label="Yangilangan rekord"
        accent={prCount > 0}
      />
    </div>
  );
}
