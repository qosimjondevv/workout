import { useMemo } from "react";
import { useWorkouts } from "../context/collections.jsx";
import { useProfile } from "../context/ProfileContext.jsx";
import {
  exerciseHistoryStats,
  findPreviousExercise,
  suggestProgression,
} from "../utils/metrics.js";

export function useExerciseInsights(exerciseNames, currentWorkoutId, date) {
  const { items: workouts } = useWorkouts();
  const { profile } = useProfile();
  const step = Number(profile.progressionStep) || 2.5;

  const namesKey = exerciseNames.join("|");

  return useMemo(() => {
    const names = namesKey.split("|").filter(Boolean);
    if (!names.length) return {};

    const history = workouts.filter((w) => w.id !== currentWorkoutId);
    const map = {};

    names.forEach((name) => {
      const previous = findPreviousExercise(history, name, date);
      const stats = exerciseHistoryStats(history, name);
      map[name] = {
        previous,
        stats,
        suggestion: suggestProgression(previous?.exercise, step),
      };
    });

    return map;
  }, [namesKey, workouts, currentWorkoutId, date, step]);
}
