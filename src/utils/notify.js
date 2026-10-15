export function vibrate(pattern = [180, 90, 180]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {}
}

let audioContext = null;

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
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.22, startAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

      osc.connect(gain);
      gain.connect(audioContext.destination);
      osc.start(startAt);
      osc.stop(startAt + duration + 0.02);
    }
  } catch {}
}

function notificationsSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

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

export async function showNotification(title, body) {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
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
  } catch {}
  try {
    const n = new Notification(title, options);
    setTimeout(() => n.close(), 8000);
  } catch {}
}
