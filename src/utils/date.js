function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO() {
  return toISO(new Date());
}

export function addDays(iso, n) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return toISO(d);
}

export function diffDays(a, b) {
  return Math.round((new Date(a + "T00:00:00") - new Date(b + "T00:00:00")) / 86400000);
}

export function fmt(dateISO) {
  if (!dateISO) return "";
  const [y, m, d] = dateISO.split("-");
  return `${d}.${m}.${y}`;
}

export function isoWeekKey(dateISO) {
  const d = new Date(dateISO + "T00:00:00");
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day + 3);
  const firstThursday = new Date(d.getFullYear(), 0, 4);
  const diff = (d - firstThursday) / 86400000;
  const week = 1 + Math.round(diff / 7);
  return `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function monthKey(dateISO) {
  return dateISO.slice(0, 7);
}

export function dotDate(dateISO) {
  return dateISO.replaceAll("-", ".");
}

const MONTH_NAMES = [
  "Yanvar",
  "Fevral",
  "Mart",
  "Aprel",
  "May",
  "Iyun",
  "Iyul",
  "Avgust",
  "Sentabr",
  "Oktabr",
  "Noyabr",
  "Dekabr",
];

export const WEEKDAY_LABELS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

export function shortDate(dateISO) {
  const [, m, d] = dateISO.split("-");
  return d + "." + m;
}

export function monthLabel(dateISO) {
  const [y, m] = dateISO.split("-");
  return MONTH_NAMES[Number(m) - 1] + " " + y;
}

export function addMonths(dateISO, n) {
  const d = new Date(dateISO + "T00:00:00");
  return toISO(new Date(d.getFullYear(), d.getMonth() + n, 1));
}

export function monthMatrix(dateISO) {
  const anchor = new Date(dateISO + "T00:00:00");
  const year = anchor.getFullYear();
  const month = anchor.getMonth();

  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const weeks = [];

  for (let w = 0; w < 6; w += 1) {
    const days = [];
    for (let i = 0; i < 7; i += 1) {
      const day = new Date(year, month, 1 - firstWeekday + w * 7 + i);
      days.push({ iso: toISO(day), inMonth: day.getMonth() === month });
    }
    weeks.push(days);
  }

  return weeks;
}

const WEEKDAY_NAMES = [
  "Yakshanba",
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
];

export function dateLabel(dateISO, today = todayISO()) {
  if (!dateISO) return "Sanani tanlang";
  const d = diffDays(dateISO, today);
  const prefix =
    d === 0
      ? "Bugun"
      : d === -1
        ? "Kecha"
        : d === 1
          ? "Ertaga"
          : WEEKDAY_NAMES[new Date(dateISO + "T00:00:00").getDay()];
  return `${prefix}, ${fmt(dateISO)}`;
}

export function formatClock(totalSec) {
  const s = Math.max(0, Math.floor(Number(totalSec) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

export function formatDuration(totalSec) {
  const s = Number(totalSec);
  if (!Number.isFinite(s) || s <= 0) return "";
  const minutes = Math.max(1, Math.round(s / 60));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} daq`;
  return m ? `${h} soat ${m} daq` : `${h} soat`;
}
