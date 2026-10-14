import { useMemo, useState } from "react";
import { useWorkouts } from "../context/collections.jsx";
import {
  countPersonalRecords,
  muscleGroupDistribution,
  volumeByPeriod,
} from "../utils/metrics.js";
import { muscleGroupLabel } from "../constants/muscleGroups.js";

// Tahlil sahifasining "dashboard" qismi: volume grafigi, mushak taqsimoti
// va rekordlar soni.
export function useDashboard() {
  const { items: workouts, loading } = useWorkouts();
  const [volumePeriod, setVolumePeriod] = useState("week");

  const volumeData = useMemo(
    () => volumeByPeriod(workouts, volumePeriod),
    [workouts, volumePeriod],
  );

  const prCount = useMemo(() => countPersonalRecords(workouts), [workouts]);

  // Taqsimot foizga o'giriladi: "12 set" dan ko'ra "34%" ko'proq narsa aytadi.
  const distribution = useMemo(() => {
    const raw = muscleGroupDistribution(workouts);
    const total = raw.reduce((sum, d) => sum + d.value, 0);
    if (!total) return [];
    return raw.map((d) => ({
      key: d.key,
      label: muscleGroupLabel(d.key),
      value: d.value,
      percent: Math.round((d.value / total) * 100),
    }));
  }, [workouts]);

  return {
    loading,
    volumePeriod,
    setVolumePeriod,
    volumeData,
    prCount,
    distribution,
  };
}
