// Mashqlarni mushak guruhiga bog'lash — Tahlil bo'limidagi "Muscle Group
// Distribution" grafigi va template'lar uchun kerak.
export const MUSCLE_GROUPS = [
  { key: "chest", label: "Ko'krak" },
  { key: "back", label: "Orqa" },
  { key: "shoulders", label: "Yelka" },
  { key: "biceps", label: "Biceps" },
  { key: "triceps", label: "Triceps" },
  { key: "legs", label: "Oyoq" },
  { key: "abs", label: "Press" },
  { key: "cardio", label: "Kardio" },
  { key: "other", label: "Boshqa" },
];

export const DEFAULT_MUSCLE_GROUP = "other";

export function muscleGroupLabel(key) {
  return (
    MUSCLE_GROUPS.find((g) => g.key === key)?.label ??
    MUSCLE_GROUPS[MUSCLE_GROUPS.length - 1].label
  );
}

export function normalizeMuscleGroup(key) {
  return MUSCLE_GROUPS.some((g) => g.key === key) ? key : DEFAULT_MUSCLE_GROUP;
}
