import { useState } from "react";
import { todayISO } from "../utils/date.js";
import { useMeasurements } from "../context/collections.jsx";
import { MEASUREMENT_FIELDS } from "../constants/measurementFields.js";

function emptyValues() {
  const v = {};
  MEASUREMENT_FIELDS.forEach((f) => {
    v[f.key] = "";
  });
  return v;
}

export function useMeasurementForm() {
  const { save } = useMeasurements();
  const [date, setDate] = useState(todayISO());
  const [values, setValues] = useState(emptyValues);
  const [error, setError] = useState("");

  function setValue(key, value) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function submit() {
    const hasAny = Object.values(values).some((v) => String(v).trim() !== "");
    if (!hasAny) {
      setError("Kamida bitta o'lchovni kiriting");
      return false;
    }
    setError("");
    save({ date, values });
    setValues(emptyValues());
    return true;
  }

  return { date, setDate, values, setValue, error, submit };
}
