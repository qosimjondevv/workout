// PWA: service worker va "ilovani o'rnatish".
//
// `beforeinstallprompt` sahifa yuklanishi bilan, foydalanuvchi Profil'ga
// kirishidan ANCHA OLDIN kelishi mumkin. Shuning uchun u modul darajasida
// (main.jsx dan chaqiriladigan initPwa) ushlab olinadi va kerak bo'lganda
// React'ga useSyncExternalStore orqali beriladi.

let deferredPrompt = null;
let installedNow = false;
const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn());
}

export function isStandalone() {
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

// iPhone/iPad'da o'rnatish tizim oynasi yo'q — "Ulashish -> Bosh ekranga"
// yo'riqnomasini ko'rsatish kerak. iPadOS o'zini Mac deb tanishtiradi.
export function isIos() {
  const ua = window.navigator.userAgent;
  return (
    /iphone|ipad|ipod/i.test(ua) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1)
  );
}

// "installed" | "available" | "ios" | "unavailable" — satr, ya'ni
// useSyncExternalStore uchun barqaror qiymat.
export function getInstallState() {
  if (installedNow || isStandalone()) return "installed";
  if (deferredPrompt) return "available";
  if (isIos()) return "ios";
  return "unavailable";
}

export function subscribeInstall(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function promptInstall() {
  const prompt = deferredPrompt;
  if (!prompt) return false;
  deferredPrompt = null;
  prompt.prompt();
  const { outcome } = await prompt.userChoice;
  emit();
  return outcome === "accepted";
}

function registerServiceWorker() {
  navigator.serviceWorker.register("/sw.js").catch((e) => {
    console.warn("Service worker ro'yxatdan o'tmadi:", e);
  });
}

export function initPwa() {
  if (typeof window === "undefined") return;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault(); // brauzerning o'z banneri o'rniga Profil'dagi tugma
    deferredPrompt = e;
    emit();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    installedNow = true;
    emit();
  });

  // Development'da service worker Vite'ning HMR'i bilan to'qnashadi va eski
  // fayllarni keshdan berib, chalkashtiradi — faqat production build'da.
  if (import.meta.env.PROD && "serviceWorker" in navigator) {
    if (document.readyState === "complete") registerServiceWorker();
    else window.addEventListener("load", registerServiceWorker, { once: true });
  }
}
