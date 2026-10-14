import React, { createContext, useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Pastki navigatsiya ustidagi SUZUVCHI USTUN: sinxronizatsiya holati, dam
// olish taymeri va sahifaga xos panellar (masalan Jurnal'dagi "Saqlash")
// shu yerda bitta ustunda turadi — bir-birining ustiga chiqmaydi.
//
// Sahifa o'z panelini <DockPortal> orqali ustunning PASTKI qismiga qo'yadi.
// Ustun balandligi kuzatiladi va asosiy kontentning pastki chekinishi shunga
// moslanadi: oxirgi kartochka panel ostida qolib ketmaydi.

const DockSlotContext = createContext(null);

export function DockPortal({ children }) {
  const slot = useContext(DockSlotContext);
  return slot ? createPortal(children, slot) : null;
}

// Element balandligini kuzatadi (ResizeObserver). Element state'da
// saqlanadi (callback ref), shuning uchun u paydo bo'lganda kuzatuv boshlanadi.
function useElementHeight(element) {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (!element || typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(([entry]) => {
      setHeight(Math.ceil(entry.target.getBoundingClientRect().height));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return height;
}

const NAV_HEIGHT = 68;
const GAP = 16;

// render-prop: children(dockHeight) — asosiy kontent chekinishini hisoblash uchun.
export function BottomDockLayout({ dock, children }) {
  const [column, setColumn] = useState(null);
  const [slot, setSlot] = useState(null);
  const height = useElementHeight(column);

  return (
    <DockSlotContext.Provider value={slot}>
      {children(NAV_HEIGHT + height + GAP)}
      <div
        ref={setColumn}
        className="fixed bottom-[68px] left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pb-2 z-40 flex flex-col gap-2 pointer-events-none [&>*]:pointer-events-auto"
      >
        {dock}
        <div ref={setSlot} className="empty:hidden" />
      </div>
    </DockSlotContext.Provider>
  );
}
