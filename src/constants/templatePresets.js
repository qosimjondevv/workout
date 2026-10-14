// Ilova bilan birga keladigan NAMUNA dasturlar (klassik Push / Pull / Legs).
//
// Ular Firestore'da emas, kodda turadi: foydalanuvchida hali o'z dasturi
// bo'lmasa, Jurnal sahifasida taklif sifatida ko'rinadi. Bosilsa mashg'ulot
// shu mashqlar bilan boshlanadi, "Saqlab olish" bilan esa foydalanuvchining
// o'z dasturlariga nusxalanadi va keyin erkin tahrirlanadi/o'chiriladi.
//
// Har mashqda unit va muscleGroup bor — mushak taqsimoti grafigi birinchi
// mashg'ulotdanoq to'g'ri chiqishi uchun. sets/reps — reja: dastur
// boshlanganda formada shuncha bo'sh set tayyor turadi.
//
// days — hafta kunlari (0 = DUSH ... 6 = YAK). Klassik Push/Pull/Legs
// haftasiga ikki marta, yakshanba — dam olish kuni.
export const TEMPLATE_PRESETS = [
  {
    key: "push",
    days: [0, 3], // DUSH, PAY
    name: "Push Day",
    target: "Ko'krak, Yelka, Triceps",
    exercises: [
      { name: "Shtanga bilan jim", unit: "reps", muscleGroup: "chest", sets: 4, reps: "6-8" },
      { name: "Qiya skameykada gantel jim", unit: "reps", muscleGroup: "chest", sets: 3, reps: "8-10" },
      { name: "O'tirib yelka pressi", unit: "reps", muscleGroup: "shoulders", sets: 3, reps: "8-10" },
      { name: "Yonga gantel ko'tarish", unit: "reps", muscleGroup: "shoulders", sets: 3, reps: "12-15" },
      { name: "Triceps blokda", unit: "reps", muscleGroup: "triceps", sets: 3, reps: "10-12" },
    ],
  },
  {
    key: "pull",
    days: [1, 4], // SESH, JU
    name: "Pull Day",
    target: "Orqa, Biceps",
    exercises: [
      { name: "Turnikda tortilish", unit: "reps", muscleGroup: "back", sets: 4, reps: "6-10" },
      { name: "Egilib shtanga tortish", unit: "reps", muscleGroup: "back", sets: 4, reps: "8-10" },
      { name: "Yuqori blok tortish", unit: "reps", muscleGroup: "back", sets: 3, reps: "10-12" },
      { name: "Shtanga bilan biceps", unit: "reps", muscleGroup: "biceps", sets: 3, reps: "8-10" },
      { name: "Bolg'a (hammer) biceps", unit: "reps", muscleGroup: "biceps", sets: 3, reps: "10-12" },
    ],
  },
  {
    key: "legs",
    days: [2, 5], // CHOR, SHAN
    name: "Leg Day",
    target: "Oyoq, Press",
    exercises: [
      { name: "Shtanga bilan o'tirish", unit: "reps", muscleGroup: "legs", sets: 4, reps: "6-8" },
      { name: "Rumin tortishi", unit: "reps", muscleGroup: "legs", sets: 3, reps: "8-10" },
      { name: "Oyoq pressi", unit: "reps", muscleGroup: "legs", sets: 3, reps: "10-12" },
      { name: "Boldir ko'tarish", unit: "reps", muscleGroup: "legs", sets: 4, reps: "12-15" },
      { name: "Plank", unit: "seconds", muscleGroup: "abs", sets: 3, reps: "60s" },
    ],
  },
];
