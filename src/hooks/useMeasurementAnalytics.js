import { useMemo, useState } from "react";
import { useMeasurements, useWorkouts } from "../context/collections.jsx";
import { dotDate } from "../utils/date.js";
import { measurementSeries } from "../utils/metrics.js";
import { MEASUREMENT_FIELDS } from "../constants/measurementFields.js";

export function useMeasurementAnalytics() {
  const { items, remove } = useMeasurements();
  const { items: workouts } = useWorkouts();
  const [period, setPeriod] = useState("week");
  const [selectedField, setSelectedField] = useState(MEASUREMENT_FIELDS[0].key);

  const history = useMemo(() => [...items].sort((a, b) => (a.date < b.date ? 1 : -1)), [items]);

  const chartData = useMemo(
    () =>
      measurementSeries({ measurements: items, workouts, field: selectedField, period }).map(
        (p) => ({ period: dotDate(p.date), value: p.value }),
      ),
    [items, workouts, selectedField, period],
  );

  return {
    period,
    setPeriod,
    selectedField,
    setSelectedField,
    fields: MEASUREMENT_FIELDS,
    chartData,
    history,
    deleteMeasurement: remove,
  };
}
