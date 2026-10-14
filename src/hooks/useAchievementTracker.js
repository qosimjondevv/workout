import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAchievements, useWorkouts } from "../context/collections.jsx";
import {
  achievementStats,
  evaluateAchievements,
  findAchievement,
} from "../utils/achievements.js";

// Yutuqlar bilan ishlash IKKI hookka ajratilgan:
//
//   useAchievementProgress() — faqat O'QIYDI (statistika, ochilganlar).
//                              Istalgan sahifa xavfsiz chaqira oladi.
//   useAchievementTracker()  — YOZADI (yangi yutuqni ochadi) va modalni
//                              boshqaradi. Ilovada FAQAT BIR MARTA, Shell
//                              ichida chaqiriladi.
//
// Ilgari Profil sahifasi ham yozadigan hookni chaqirardi: ikki nusxaning
// har biri o'z writingRef'iga ega edi va bitta yutuq ikki marta yozilib,
// unlockedAt qayta yozilib ketardi.

export function useAchievementProgress() {
  const { items: workouts, loading: workoutsLoading } = useWorkouts();
  const { items: unlocked, loading: achievementsLoading } = useAchievements();

  const stats = useMemo(() => achievementStats(workouts), [workouts]);

  const unlockedKeys = useMemo(
    () => new Set(unlocked.map((a) => a.key)),
    [unlocked],
  );

  return {
    stats,
    unlocked,
    unlockedKeys,
    loading: workoutsLoading || achievementsLoading,
  };
}

// "Yangi ochilgan" ni aniqlash uchun sessiya boshlangan vaqt bilan
// solishtiriladi — shuning uchun effect ichida holat to'plash shart emas va
// kaskadli renderlar bo'lmaydi.
export function useAchievementTracker() {
  const { stats, unlocked, unlockedKeys, loading } = useAchievementProgress();
  const { save } = useAchievements();

  const [sessionStart] = useState(() => Date.now());
  const [dismissed, setDismissed] = useState([]);
  const writingRef = useRef(new Set());

  const earned = useMemo(() => evaluateAchievements(stats), [stats]);

  // Massiv o'rniga SATR: bog'liqlik har renderda o'zgarib ketmasligi uchun.
  const toUnlockKey = useMemo(() => {
    if (loading) return "";
    return earned.filter((k) => !unlockedKeys.has(k)).join("|");
  }, [earned, unlockedKeys, loading]);

  useEffect(() => {
    const keys = toUnlockKey
      .split("|")
      .filter((k) => k && !writingRef.current.has(k));
    if (!keys.length) return;

    // Eski tarixi bor odam birinchi kirganda o'nlab yutuq birdan ochiladi.
    // Bunday holda modal ko'rsatilmaydi — ular shunchaki ro'yxatga tushadi.
    const silent = keys.length > 3;

    keys.forEach((key) => {
      writingRef.current.add(key);
      // save() xatoni o'zi ushlaydi va null qaytaradi. Shunda kalitni
      // bo'shatamiz — keyingi o'zgarishda yozuv qayta urinib ko'riladi.
      Promise.resolve(save({ key, silent })).then((result) => {
        if (result === null) writingRef.current.delete(key);
      });
    });
  }, [toUnlockKey, save]);

  // Shu SESSIYADA ochilgan, hali yopilmagan yutuqlar. Sessiya boshlangan
  // vaqtga tayanganimiz uchun eski yutuqlar qayta ko'rsatilmaydi.
  const fresh = useMemo(
    () =>
      unlocked
        .filter((a) => !a.silent && !dismissed.includes(a.key))
        .filter((a) => Date.parse(a.unlockedAt ?? "") >= sessionStart)
        .map((a) => findAchievement(a.key))
        .filter(Boolean)
        .sort((a, b) => a.threshold - b.threshold),
    [unlocked, dismissed, sessionStart],
  );

  const pending = fresh.length
    ? { achievement: fresh[0], remaining: fresh.length - 1 }
    : null;

  // 'fresh' memolangan, 'pending' esa har renderda qayta yaratiladi —
  // shuning uchun bog'liqlik sifatida 'fresh' olinadi.
  const dismiss = useCallback(() => {
    const first = fresh[0];
    if (!first) return;
    setDismissed((d) => [...d, first.key]);
  }, [fresh]);

  return { pending, dismiss };
}
