import { ACHIEVEMENTS } from "../constants/achievements.js";
import { computeStreaks, countPersonalRecords, workoutVolume } from "./metrics.js";

export function achievementStats(workouts) {
  const volume = workouts.reduce((sum, w) => sum + (Number(w.totalVolume) || workoutVolume(w)), 0);
  const { longest } = computeStreaks(workouts.map((w) => w.date));

  return {
    workouts: workouts.length,
    streak: longest,
    pr: countPersonalRecords(workouts),
    volume: Math.round(volume),
  };
}

export function evaluateAchievements(stats) {
  return ACHIEVEMENTS.filter((a) => (Number(stats?.[a.metric]) || 0) >= a.threshold).map(
    (a) => a.key,
  );
}

export function findAchievement(key) {
  return ACHIEVEMENTS.find((a) => a.key === key) ?? null;
}
