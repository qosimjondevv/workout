import React, { createContext, useContext } from "react";
import { useCollectionStore } from "../hooks/stores/useCollectionStore.js";

export function createCollectionContext(config) {
  const Ctx = createContext(null);

  function Provider({ children }) {
    const store = useCollectionStore(config);
    return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
  }

  function useStore() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error(`"${config.name}" konteksti topilmadi — Provider ichida chaqiring`);
    return ctx;
  }

  return { Provider, useStore };
}
