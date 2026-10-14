import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

// Firebase'ning YAGONA ishga tushirish nuqtasi. Boshqa hech bir fayl
// initializeApp chaqirmaydi va hech bir komponent bu faylni to'g'ridan-to'g'ri
// import qilmaydi — faqat services/ ichidagi modullar ishlatadi.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Qiymatlar .env (lokal) yoki Vercel'ning Environment Variables bo'limidan
// keladi. Biri unutilsa Firebase tushunarsiz xato beradi va sahifa bo'sh
// qoladi — shuning uchun qaysi nom yetishmayotganini aniq aytamiz.
const missing = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => "VITE_FIREBASE_" + key.replace(/[A-Z]/g, (c) => "_" + c).toUpperCase());
if (missing.length) {
  throw new Error(
    `Firebase sozlamalari topilmadi: ${missing.join(", ")}. ` +
      "Lokal: .env.example ni .env ga nusxalab to'ldiring. " +
      "Vercel: Project Settings -> Environment Variables ga qo'shing va qayta deploy qiling.",
  );
}

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Offline-first: ma'lumot IndexedDB'da yotadi, yozuvlar internetsiz ham
// navbatga tushadi va aloqa tiklangach Firestore ularni o'zi yuboradi.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
