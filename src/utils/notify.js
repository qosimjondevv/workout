// Qurilma ichidagi signallar: tovush, tebranish va brauzer bildirishnomasi.
// Hech qanday server yoki tashqi fayl kerak emas.
//
// Hammasi "mumkin bo'lsa" tamoyilida: brauzer qo'llab-quvvatlamasa yoki
// foydalanuvchi ruxsat bermasa, ilova xatosiz davom etadi.

export function vibrate(pattern = [180, 90, 180]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Tebranish ixtiyoriy — qo'llab-quvvatlanmasa e'tibor bermaymiz.
  }
}

let audioContext = null;

// Tovush fayli o'rniga Web Audio bilan generatsiya qilinadi: ilovaga
// qo'shimcha mp3 yuklash shart emas va kechikish nolga yaqin.
export function beep({ frequency = 880, duration = 0.16, times = 2 } = {}) {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    audioContext = audioContext ?? new AudioCtx();
    if (audioContext.state === "suspended") audioContext.resume();

    for (let i = 0; i < times; i += 1) {
      const startAt = audioContext.currentTime + i * (duration + 0.09);
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();

      osc.type = "sine";
      osc.frequency.value = frequency;
      // Keskin "klik" bo'lmasligi uchun ovoz yumshoq ko'tarilib tushadi.
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.22, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(startAt);
      osc.stop(startAt + duration + 0.02);
    }
  } catch {
    // Ovoz chiqmasa ham taymer ishlashda davom etadi.
  }
}

export function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

// Ruxsat FAQAT foydalanuvchi harakatidan keyin so'raladi (taymer boshlanganda),
// sahifa ochilishi bilan emas — aks holda brauzer so'rovni bloklaydi.
export async function requestNotificationPermission() {
  if (!notificationsSupported()) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try {
    return (await Notification.requestPermission()) === "granted";
  } catch {
    return false;
  }
}

// Android Chrome'da `new Notification()` umuman ishlamaydi (xato tashlaydi) —
// u yerda bildirishnoma faqat service worker orqali chiqadi. Shuning uchun
// SW ro'yxatdan o'tgan bo'lsa (production / o'rnatilgan ilova) o'sha
// ishlatiladi, aks holda oddiy Notification.
export async function showNotification(title, body) {
  if (!notificationsSupported() || Notification.permission !== "granted")
    return;
  const options = {
    body,
    tag: "temir-jurnal-rest",
    renotify: true,
    silent: false,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
  };
  try {
    const reg = await navigator.serviceWorker?.getRegistration?.();
    if (reg) {
      await reg.showNotification(title, options);
      return;
    }
  } catch {
    // SW orqali chiqmadi — oddiy usulga o'tamiz.
  }
  try {
    const n = new Notification(title, options);
    setTimeout(() => n.close(), 8000);
  } catch {
    // Ba'zi brauzerlar service worker'siz Notification'ni cheklaydi.
  }
}
