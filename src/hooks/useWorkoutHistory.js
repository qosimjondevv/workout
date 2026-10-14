import { useMemo, useState } from "react";
import { useWorkouts } from "../context/collections.jsx";
import { addDays, todayISO } from "../utils/date.js";

export function useWorkoutHistory() {
  const { items, loading } = useWorkouts();
  // Boshlang'ich holat "Hammasi": foydalanuvchi ilovani ochganda butun
  // tarixini ko'radi, 7/30 kunlik kesim esa ixtiyoriy filtr bo'lib qoladi.
  const [historyFilter, setHistoryFilter] = useState("all");

  const sortedWorkouts = useMemo(
    () => [...items].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [items],
  );

  const filteredHistory = useMemo(() => {
    if (historyFilter === "all") return sortedWorkouts;
    const cutoff = addDays(todayISO(), -historyFilter);
    return sortedWorkouts.filter((w) => w.date >= cutoff);
  }, [sortedWorkouts, historyFilter]);

  return { historyFilter, setHistoryFilter, filteredHistory, loading };
}
