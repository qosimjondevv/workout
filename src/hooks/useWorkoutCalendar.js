import { useMemo, useState } from "react";
import { useWorkouts } from "../context/collections.jsx";
import { addMonths, monthMatrix, monthLabel, todayISO } from "../utils/date.js";

export function useWorkoutCalendar() {
  const { items: workouts, loading } = useWorkouts();
  const [anchor, setAnchor] = useState(() => todayISO());
  const [selectedDate, setSelectedDate] = useState(null);

  const byDate = useMemo(() => {
    const map = new Map();
    workouts.forEach((w) => {
      if (!w.date) return;
      const list = map.get(w.date) ?? [];
      list.push(w);
      map.set(w.date, list);
    });
    return map;
  }, [workouts]);

  const weeks = useMemo(() => monthMatrix(anchor), [anchor]);

  const monthStats = useMemo(() => {
    const prefix = anchor.slice(0, 7);
    const inMonth = workouts.filter((w) => w.date?.startsWith(prefix));
    const days = new Set(inMonth.map((w) => w.date));
    return { workouts: inMonth.length, days: days.size };
  }, [workouts, anchor]);

  const selectedWorkouts = selectedDate ? (byDate.get(selectedDate) ?? []) : [];

  return {
    loading,
    label: monthLabel(anchor),
    weeks,
    byDate,
    today: todayISO(),
    monthStats,
    selectedDate,
    selectedWorkouts,
    selectDate: setSelectedDate,
    clearSelection: () => setSelectedDate(null),
    prevMonth: () => setAnchor((a) => addMonths(a, -1)),
    nextMonth: () => setAnchor((a) => addMonths(a, 1)),
  };
}
