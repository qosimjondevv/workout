import { round } from "./num.js";

export function computeTrend(data, key) {
  if (!data || data.length < 2) return null;

  const first = Number(data[0][key]);
  const last = Number(data[data.length - 1][key]);
  if (!Number.isFinite(first) || !Number.isFinite(last)) return null;

  const diff = last - first;
  const percent = first === 0 ? null : round((diff / Math.abs(first)) * 100, 1);
  const direction = diff > 0 ? "up" : diff < 0 ? "down" : "same";

  return { first, last, diff: round(diff, 1), percent, direction };
}
