import { useMemo, useState } from "react";
import { useWorkouts } from "../context/collections.jsx";
import { countPersonalRecords, muscleGroupDistribution, volumeByPeriod } from "../utils/metrics.js";
import { muscleGroupLabel } from "../constants/muscleGroups.js";

export function useDashboard() {
  const { items: workouts } = useWorkouts();
  const [volumePeriod, setVolumePeriod] = useState("week");

  const volumeData = useMemo(
    () => volumeByPeriod(workouts, volumePeriod),
    [workouts, volumePeriod],
  );

  const prCount = useMemo(() => countPersonalRecords(workouts), [workouts]);

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
    volumePeriod,
    setVolumePeriod,
    volumeData,
    prCount,
    distribution,
  };
}
