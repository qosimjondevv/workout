export const BODY_WEIGHT_KEY = "vazn";

export const MEASUREMENT_FIELDS = [
  { key: BODY_WEIGHT_KEY, label: "Tana vazni", unit: "kg", min: 20, max: 400 },
  { key: "bel", label: "Bel", unit: "sm", min: 10, max: 300 },
  { key: "yelka", label: "Yelka", unit: "sm", min: 10, max: 300 },
  { key: "kokrak", label: "Ko'krak", unit: "sm", min: 10, max: 300 },
  { key: "qol", label: "Qo'l (bicep)", unit: "sm", min: 10, max: 300 },
  { key: "oyoq", label: "Son (oyoq)", unit: "sm", min: 10, max: 300 },
];

export const CIRCUMFERENCE_FIELDS = MEASUREMENT_FIELDS.filter((f) => f.key !== BODY_WEIGHT_KEY);

export function measurementField(key) {
  return MEASUREMENT_FIELDS.find((f) => f.key === key) ?? MEASUREMENT_FIELDS[0];
}
