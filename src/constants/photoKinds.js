// Before/After taqqoslash uchun rakurslar. Bir xil rakursdagi suratlarni
// yonma-yon qo'yish ma'noli, turli rakursdagilarni esa yo'q.
export const PHOTO_KINDS = [
  { key: "front", label: "Oldindan" },
  { key: "side", label: "Yonboshdan" },
  { key: "back", label: "Orqadan" },
];

export const DEFAULT_PHOTO_KIND = "front";

export function normalizePhotoKind(key) {
  return PHOTO_KINDS.some((k) => k.key === key) ? key : DEFAULT_PHOTO_KIND;
}
