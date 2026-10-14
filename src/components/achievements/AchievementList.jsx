import React from "react";
import { Card, CardTitle } from "../../ui/card.jsx";
import AchievementIcon from "./AchievementIcon.jsx";
import { ACHIEVEMENTS, TIER_STYLES } from "../../constants/achievements.js";
import { cn } from "../../utils/cn.js";
import { formatCompact } from "../../utils/num.js";

// Ochilmagan yutuq ham KO'RINADI (xiralashgan holda) va unga qancha
// qolgani yoziladi — bu keyingi maqsadni ko'rsatib turadi.
function progressLabel(achievement, stats) {
  const current = Number(stats?.[achievement.metric]) || 0;
  if (achievement.metric === "volume")
    return `${formatCompact(current)} / ${formatCompact(achievement.threshold)}`;
  return `${current} / ${achievement.threshold}`;
}

export default function AchievementList({ unlockedKeys, stats }) {
  const unlockedCount = ACHIEVEMENTS.filter((a) =>
    unlockedKeys.has(a.key),
  ).length;

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <CardTitle>Yutuqlar</CardTitle>
        <span className="text-[11px] text-brand-muted">
          {unlockedCount} / {ACHIEVEMENTS.length}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = unlockedKeys.has(a.key);
          const tier = TIER_STYLES[a.tier] ?? TIER_STYLES.bronze;
          return (
            <div
              key={a.key}
              className={cn(
                "bg-brand-surface2 rounded-md p-2.5 flex items-start gap-2",
                !unlocked && "opacity-40",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 shrink-0 rounded-full border flex items-center justify-center",
                  unlocked ? tier : "border-brand-line text-brand-muted",
                )}
              >
                <AchievementIcon name={a.icon} size={15} />
              </div>
              <div className="min-w-0">
                <div className="text-[12px] font-semibold text-brand-text leading-tight">
                  {a.label}
                </div>
                <div className="text-[10px] text-brand-muted mt-0.5">
                  {unlocked ? a.description : progressLabel(a, stats)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
