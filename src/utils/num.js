export function toNum(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim().replace(",", ".");
  if (text === "") return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

export function toStr(value) {
  return value === null || value === undefined ? "" : String(value);
}

export function round(value, digits = 1) {
  const n = toNum(value);
  if (n === null) return null;
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

export function formatCompact(value) {
  const n = toNum(value);
  if (n === null) return "-";
  const abs = Math.abs(n);
  if (abs >= 1000000) return round(n / 1000000, 1) + "M";
  if (abs >= 1000) return round(n / 1000, 1) + "k";
  return String(Math.round(n));
}
