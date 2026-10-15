import { useMemo, useState } from "react";
import { useMeasurements } from "../context/collections.jsx";
import { isoWeekKey, monthKey, dotDate } from "../utils/date.js";
import { MEASUREMENT_FIELDS } from "../constants/measurementFields.js";

export function useMeasurementAnalytics() {
  const { items, loading, remove } = useMeasurements();
  const [period, setPeriod] = useState("week");
  const [selectedField, setSelectedField] = useState(MEASUREMENT_FIELDS[0].key);

  const history = useMemo(() => [...items].sort((a, b) => (a.date < b.date ? 1 : -1)), [items]);

  const chartData = useMemo(() => {
    const keyFn = period === "week" ? isoWeekKey : monthKey;
    const byPeriod = new Map();
    [...items]
      .filter((m) => m?.date)
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .forEach((m) => byPeriod.set(keyFn(m.date), m));

    return Array.from(byPeriod.values())
      .map((m) => ({
        period: dotDate(m.date),
        value: Number(m.values?.[selectedField]),
      }))
      .filter((d) => Number.isFinite(d.value));
  }, [items, period, selectedField]);

  return {
    loading,
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
