function normalizePhone(raw) {
  return raw.replace(/\D/g, "");
}

export function toFullPhone(raw) {
  const digits = normalizePhone(raw);
  if (digits.length === 9) return "998" + digits;
  return digits;
}

export function phoneToPseudoEmail(raw) {
  const phone = toFullPhone(raw);
  return `${phone}@temirjurnal.local`;
}

export function formatPhoneDisplay(raw) {
  const digits = toFullPhone(raw);
  if (digits.length !== 12) return raw;
  return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
}
