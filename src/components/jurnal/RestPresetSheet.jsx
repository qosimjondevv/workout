import React from "react";
import { Timer } from "lucide-react";
import { Modal } from "../../ui/dialog.jsx";
import { REST_PRESETS } from "../../constants/restPresets.js";
import { cn } from "../../utils/cn.js";

export default function RestPresetSheet({ open, defaultSeconds, onPick, onClose }) {
  const presets = REST_PRESETS.filter((p) => p.seconds !== defaultSeconds);

  return (
    <Modal open={open} title="Dam olish" onClose={onClose}>
      <button
        type="button"
        onClick={() => onPick(defaultSeconds)}
        className="w-full flex items-center justify-center gap-2 py-3 mb-2 rounded-md border border-brand-accent bg-brand-accent/10 text-brand-accent font-semibold text-sm cursor-pointer"
      >
        <Timer size={16} /> {defaultSeconds} soniya
        <span className="text-[10px] font-normal opacity-70">(sizning)</span>
      </button>

      <div className="grid grid-cols-2 gap-2">
        {presets.map((p) => (
          <button
            key={p.seconds}
            type="button"
            onClick={() => onPick(p.seconds)}
            className={cn(
              "py-2.5 rounded-md border border-brand-line bg-brand-surface2",
              "text-brand-text text-sm font-semibold cursor-pointer hover:border-brand-accent",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </Modal>
  );
}
