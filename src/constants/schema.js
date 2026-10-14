// Ma'lumot modeli versiyasi.
//   1 -> nomlanmagan boshlang'ich model
//   2 -> bitta hujjat: users/{uid}/appData/main
//   3 -> subcollection'lar: users/{uid}/workouts, /exercises, /measurements ...
//
// Profil hujjatidagi schemaVersion shu qiymatdan kichik bo'lsa migratsiya ishga tushadi.
export const SCHEMA_VERSION = 3;
