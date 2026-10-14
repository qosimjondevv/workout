import React, { createContext, useContext } from "react";
import { useCollectionStore } from "../hooks/stores/useCollectionStore.js";

// Har kolleksiya uchun bir xil Provider + hook yozib chiqmaslik uchun fabrika.
// Har biri ALOHIDA kontekst bo'lgani muhim: mashg'ulot o'zgarganda o'lchamlar
// ro'yxatini ko'rsatayotgan komponent qayta render bo'lmaydi.
export function createCollectionContext(config) {
  const Ctx = createContext(null);

  function Provider({ children }) {
    const store = useCollectionStore(config);
    return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
  }

  function useStore() {
    const ctx = useContext(Ctx);
    if (!ctx)
      throw new Error(
        `"${config.name}" konteksti topilmadi — Provider ichida chaqiring`,
      );
    return ctx;
  }

  return { Provider, useStore };
}
