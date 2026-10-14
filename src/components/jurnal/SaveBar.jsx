import React from "react";
import { Save } from "lucide-react";
import { Button } from "../../ui/button.jsx";
import { formatCompact } from "../../utils/num.js";

// Doim ko'rinib turadigan saqlash paneli (pastki suzuvchi ustunda, taymer
// ostida). Ilgari tugma formaning eng pastida edi va 5-6 mashqdan keyin
// unga yetish uchun uzoq aylantirish kerak bo'lardi.
//
// Tugma ATAYLAB bloklanmaydi: offline rejimda Firestore yozuvni mahalliy
// saqlab, server tasdig'ini keyinga qoldiradi.
export default function SaveBar({ summary, isEditing, error, onSave }) {
  return (
    <div className="bg-brand-surface border border-brand-line rounded-md px-3 py-2 shadow-lg">
      {error && <div className="text-brand-accent2 text-[11px] mb-1.5">{error}</div>}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0 text-[11px] text-brand-muted leading-tight">
          <div className="text-brand-text text-[12px] font-semibold">
            {summary.exercises} mashq · {summary.doneSets}/{summary.sets} set
          </div>
          {summary.volume > 0 && <div>Hajm: {formatCompact(summary.volume)} kg</div>}
        </div>
        <Button onClick={onSave} className="font-display uppercase tracking-wide text-sm px-5 shrink-0">
          <Save size={15} /> {isEditing ? "Yangilash" : "Saqlash"}
        </Button>
      </div>
    </div>
  );
}
