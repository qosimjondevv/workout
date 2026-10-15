import { useMemo, useState } from "react";
import { useWorkouts } from "../context/collections.jsx";
import { diffDays, fmt, todayISO } from "../utils/date.js";
import { computeStreaks, exerciseStats, workoutVolume } from "../utils/metrics.js";

export function useAnalytics() {
  const { items: workouts, loading } = useWorkouts();
  const [requestedExercise, setSelectedExercise] = useState("");

  const allExerciseNames = useMemo(() => {
    const set = new Set();
    workouts.forEach((w) => (w.exercises ?? []).forEach((e) => set.add(e.name)));
    return Array.from(set).sort();
  }, [workouts]);

  const selectedExercise =
    requestedExercise && allExerciseNames.includes(requestedExercise)
      ? requestedExercise
      : (allExerciseNames[0] ?? "");

  const selectedExerciseUnit = useMemo(() => {
    for (const w of workouts) {
      const ex = (w.exercises ?? []).find((e) => e.name === selectedExercise);
      if (ex) return ex.unit || "reps";
    }
    return "reps";
  }, [workouts, selectedExercise]);

  const exerciseChartData = useMemo(() => {
    if (!selectedExercise) return [];
    return [...workouts]
      .filter((w) => (w.exercises ?? []).some((e) => e.name === selectedExercise))
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .map((w) => {
        const s = exerciseStats(w.exercises.find((e) => e.name === selectedExercise));
        return {
          date: fmt(w.date),
          value: s.unit === "seconds" ? s.bestTime : s.bestWeight,
        };
      });
  }, [workouts, selectedExercise]);

  const bodyWeightData = useMemo(
    () =>
      [...workouts]
        .filter((w) => w.bodyWeight != null && Number.isFinite(Number(w.bodyWeight)))
        .sort((a, b) => (a.date > b.date ? 1 : -1))
        .map((w) => ({ date: fmt(w.date), weight: Number(w.bodyWeight) })),
    [workouts],
  );

  const stats = useMemo(() => {
    const today = todayISO();

    const last7 = workouts.filter((w) => {
      const d = diffDays(today, w.date);
      return d >= 0 && d < 7;
    }).length;

    const totalVolume = workouts.reduce(
      (sum, w) => sum + (Number(w.totalVolume) || workoutVolume(w)),
      0,
    );

    const { current, longest } = computeStreaks(workouts.map((w) => w.date));

    return {
      total: workouts.length,
      last7,
      totalVolume: Math.round(totalVolume),
      currentStreak: current,
      longestStreak: longest,
    };
  }, [workouts]);

  return {
    loading,
    stats,
    allExerciseNames,
    selectedExercise,
    setSelectedExercise,
    selectedExerciseUnit,
    exerciseChartData,
    bodyWeightData,
  };
}
