import React, { createContext, useContext } from "react";
import { useWorkoutForm } from "../hooks/useWorkoutForm.js";

// Joriy mashg'ulot formasi ILOVA darajasida turadi, sahifa darajasida emas:
//   - Tahlil yoki Profilga o'tib qaytsangiz ham to'ldirilgan forma joyida;
//   - Tarix sahifasidan "Tahrirlash" bosilsa, yozuv shu formaga yuklanadi.
const WorkoutFormContext = createContext(null);

export function WorkoutFormProvider({ children }) {
  const value = useWorkoutForm();
  return (
    <WorkoutFormContext.Provider value={value}>
      {children}
    </WorkoutFormContext.Provider>
  );
}

export function useWorkoutFormContext() {
  const ctx = useContext(WorkoutFormContext);
  if (!ctx)
    throw new Error("useWorkoutFormContext() <WorkoutFormProvider> ichida ishlaydi");
  return ctx;
}
