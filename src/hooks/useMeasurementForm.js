import { useMemo, useState } from "react";
import { todayISO } from "../utils/date.js";
import { useMeasurements, useWorkouts } from "../context/collections.jsx";
import { latestBodyWeight } from "../utils/metrics.js";
import { MEASUREMENT_FIELDS } from "../constants/measurementFields.js";
import { validateMeasurement } from "../utils/catalog.js";

function emptyValues() {
  const v = {};
  MEASUREMENT_FIELDS.forEach((f) => {
    v[f.key] = "";
  });
  return v;
}

export function useMeasurementForm() {
  const { items: measurements, save } = useMeasurements();
  const { items: workouts } = useWorkouts();
  const lastWeight = useMemo(
    () => latestBodyWeight(workouts, measurements),
    [workouts, measurements],
  );
  const [date, setDate] = useState(todayISO);
  const [values, setValues] = useState(emptyValues);
  const [error, setError] = useState("");

  function setValue(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function submit() {
    const problem = validateMeasurement(values);
    if (problem) {
      setError(problem);
      return false;
    }
    setError("");
    save({ date, values });
    setValues(emptyValues());
    return true;
  }

  return { date, setDate, values, setValue, error, submit, lastWeight };
}
