export const REST_PRESETS = [30, 60, 90, 120, 180];

export const DEFAULT_REST_SECONDS = 90;
export const MIN_REST_SECONDS = 10;
export const MAX_REST_SECONDS = 600;
export const REST_STEP_SECONDS = 15;

export function normalizeRestSeconds(value) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_REST_SECONDS;
  return Math.min(MAX_REST_SECONDS, Math.max(MIN_REST_SECONDS, n));
}
