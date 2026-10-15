import React from "react";
import { Button } from "../../ui/button.jsx";
import { Modal } from "../../ui/dialog.jsx";
import AchievementIcon from "./AchievementIcon.jsx";
import { TIER_STYLES } from "../../constants/achievements.js";
import { cn } from "../../utils/cn.js";

export default function AchievementModal({ pending, onClose }) {
  if (!pending) return null;

  const { achievement, remaining } = pending;
  const tier = TIER_STYLES[achievement.tier] ?? TIER_STYLES.bronze;

  return (
    <Modal open title="Yangi yutuq" onClose={onClose}>
      <div className="text-center py-2">
        <div
          className={cn(
            "w-16 h-16 mx-auto rounded-full border-2 flex items-center justify-center mb-3",
            tier,
          )}
        >
          <AchievementIcon name={achievement.icon} size={28} />
        </div>

        <div className="font-display text-[18px] uppercase tracking-wide text-brand-text">
          {achievement.label}
        </div>
        <div className="text-[13px] text-brand-muted mt-1">{achievement.description}</div>

        {remaining > 0 && (
          <div className="text-[11px] text-brand-muted mt-3">Yana {remaining} ta yutuq ochildi</div>
        )}

        <Button
          onClick={onClose}
          className="w-full mt-4 font-display uppercase tracking-wide text-sm"
        >
          {remaining > 0 ? "Keyingisi" : "Zo'r!"}
        </Button>
      </div>
    </Modal>
  );
}
