import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useSync } from "../../context/SyncContext.jsx";

const EMPTY = [];

// Har kolleksiya bir xil ishlaydi: real vaqt obunasi + saqlash + o'chirish.
// Shuning uchun mantiq bir marta yoziladi, domen konteksti faqat servis
// funksiyalarini beradi.
//
// MUHIM 1: yozuvlar natijasini KUTMAYMIZ. Firestore mahalliy keshni darhol
// yangilaydi va onSnapshot shu zahoti ishlaydi, ya'ni ekran bir zumda
// yangilanadi. Server bilan sinxronizatsiya fonda ketadi.
//
// MUHIM 2: holat uid bilan BIRGA saqlanadi. Shu sabab effect ichida
// setState chaqirish shart emas (kaskadli render bo'lmaydi) va foydalanuvchi
// almashganda oldingi akkauntning ro'yxati bir lahzaga ko'rinib qolmaydi.
export function useCollectionStore({
  name,
  subscribe,
  save,
  remove,
  saveError = "Saqlanmadi. Qayta urinib ko'ring.",
  removeError = "O'chirib bo'lmadi. Qayta urinib ko'ring.",
}) {
  const { user } = useAuth();
  const { run, setSourcePending } = useSync();
  const uid = user?.uid ?? null;

  const [state, setState] = useState({
    uid: null,
    items: EMPTY,
    loading: true,
    failed: false,
  });

  useEffect(() => {
    if (!uid) return undefined;

    const unsubscribe = subscribe(
      uid,
      (docs, meta) => {
        setState({ uid, items: docs, loading: false, failed: false });
        setSourcePending(name, Boolean(meta?.pending));
      },
      (e) => {
        console.error(`"${name}" kolleksiyasini o'qishda xato:`, e);
        setState({ uid, items: EMPTY, loading: false, failed: true });
      },
    );

    return () => {
      unsubscribe();
      setSourcePending(name, false);
    };
  }, [uid, name, subscribe, setSourcePending]);

  const saveItem = useCallback(
    (payload) => {
      if (!uid) return null;
      return run(() => save(uid, payload), saveError);
    },
    [uid, run, save, saveError],
  );

  const removeItem = useCallback(
    (id) => {
      if (!uid) return null;
      return run(() => remove(uid, id), removeError);
    },
    [uid, run, remove, removeError],
  );

  const matches = state.uid === uid;

  return useMemo(
    () => ({
      items: matches ? state.items : EMPTY,
      loading: uid ? !matches || state.loading : false,
      failed: matches ? state.failed : false,
      save: saveItem,
      remove: removeItem,
    }),
    [matches, state, uid, saveItem, removeItem],
  );
}
