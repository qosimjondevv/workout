import React, { useSyncExternalStore } from "react";
import { Share, Smartphone, SquarePlus } from "lucide-react";
import { Card } from "../../ui/card.jsx";
import { Button } from "../../ui/button.jsx";
import { getInstallState, promptInstall, subscribeInstall } from "../../utils/pwa.js";

export default function InstallAppCard() {
  const state = useSyncExternalStore(subscribeInstall, getInstallState);
  if (state === "installed" || state === "unavailable") return null;

  return (
    <Card className="mb-4 border border-brand-accent/30">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 shrink-0 rounded-full bg-brand-accent/10 text-brand-accent flex items-center justify-center">
          <Smartphone size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-brand-text">Telefonga o'rnating</div>
          <div className="text-[11px] text-brand-muted mt-0.5 leading-relaxed">
            Bosh ekrandan bir bosishda ochiladi, internetsiz ham ishlaydi.
          </div>

          {state === "available" ? (
            <Button size="sm" onClick={promptInstall} className="mt-2.5">
              O'rnatish
            </Button>
          ) : (
            <div className="text-[11px] text-brand-text mt-2 leading-relaxed">
              Safari'da <Share size={12} className="inline -mt-0.5 text-brand-accent" /> "Ulashish"
              tugmasini bosing, so'ng{" "}
              <SquarePlus size={12} className="inline -mt-0.5 text-brand-accent" /> "Bosh ekranga
              qo'shish" ni tanlang.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
