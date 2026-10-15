import React from "react";
import { Award, Dumbbell, Flame, Footprints, Layers, Trophy } from "lucide-react";

const ICONS = {
  footprints: Footprints,
  dumbbell: Dumbbell,
  flame: Flame,
  award: Award,
  layers: Layers,
};

export default function AchievementIcon({ name, size = 20, className }) {
  const Icon = ICONS[name] ?? Trophy;
  return <Icon size={size} className={className} />;
}
