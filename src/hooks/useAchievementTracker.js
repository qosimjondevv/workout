import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAchievements, useWorkouts } from "../context/collections.jsx";
import { achievementStats, evaluateAchievements, findAchievement } from "../utils/achievements.js";

export function useAchievementProgress() {
  const { items: workouts, loading: workoutsLoading } = useWorkouts();
  const { items: unlocked, loading: achievementsLoading } = useAchievements();

  const stats = useMemo(() => achievementStats(workouts), [workouts]);

  const unlockedKeys = useMemo(() => new Set(unlocked.map((a) => a.key)), [unlocked]);

  return {
    stats,
    unlocked,
    unlockedKeys,
    loading: workoutsLoading || achievementsLoading,
  };
}

export function useAchievementTracker() {
  const { stats, unlocked, unlockedKeys, loading } = useAchievementProgress();
  const { save } = useAchievements();

  const [sessionStart] = useState(() => Date.now());
  const [dismissed, setDismissed] = useState([]);
  const writingRef = useRef(new Set());

  const earned = useMemo(() => evaluateAchievements(stats), [stats]);

  const toUnlockKey = useMemo(() => {
    if (loading) return "";
    return earned.filter((k) => !unlockedKeys.has(k)).join("|");
  }, [earned, unlockedKeys, loading]);

  useEffect(() => {
    const keys = toUnlockKey.split("|").filter((k) => k && !writingRef.current.has(k));
    if (!keys.length) return;

    const silent = keys.length > 3;

    keys.forEach((key) => {
      writingRef.current.add(key);
      Promise.resolve(save({ key, silent })).then((result) => {
        if (result === null) writingRef.current.delete(key);
      });
    });
  }, [toUnlockKey, save]);

  const fresh = useMemo(
    () =>
      unlocked
        .filter((a) => !a.silent && !dismissed.includes(a.key))
        .filter((a) => Date.parse(a.unlockedAt ?? "") >= sessionStart)
        .map((a) => findAchievement(a.key))
        .filter(Boolean)
        .sort((a, b) => a.threshold - b.threshold),
    [unlocked, dismissed, sessionStart],
  );

  const pending = fresh.length ? { achievement: fresh[0], remaining: fresh.length - 1 } : null;

  const dismiss = useCallback(() => {
    const first = fresh[0];
    if (!first) return;
    setDismissed((d) => [...d, first.key]);
  }, [fresh]);

  return { pending, dismiss };
}
