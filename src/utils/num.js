// Forma inputlari har doim matn beradi, Firestore'da esa raqam saqlanadi
// (Volume, 1RM, o'rtacha kabi hisoblar uchun shart). Konvertatsiya shu yerda,
// bitta joyda turadi.

// Matndan raqamga. Bo'sh yoki noto'g'ri qiymat -> null (0 EMAS, chunki
// "kiritilmagan" bilan "nol" ni farqlash kerak).
export function toNum(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim().replace(",", ".");
  if (text === "") return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

// Raqamdan forma inputiga.
export function toStr(value) {
  return value === null || value === undefined ? "" : String(value);
}

// Grafik va statistikada ko'rsatish uchun ortiqcha nollarni kesadi: 72.50 -> 72.5
export function round(value, digits = 1) {
  const n = toNum(value);
  if (n === null) return null;
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

// Katta raqamlarni qisqartirish: 12345 -> "12.3k". Umumiy volume kilogrammda
// o'lchanadi va tezda o'n minglarga chiqadi, statistika kartochkasiga esa
// to'liq raqam sig'maydi.
export function formatCompact(value) {
  const n = toNum(value);
  if (n === null) return "-";
  const abs = Math.abs(n);
  if (abs >= 1000000) return round(n / 1000000, 1) + "M";
  if (abs >= 1000) return round(n / 1000, 1) + "k";
  return String(Math.round(n));
}
