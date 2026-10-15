import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { Card, CardTitle } from "../../ui/card.jsx";
import { ConfirmDialog } from "../../ui/dialog.jsx";
import { MEASUREMENT_FIELDS } from "../../constants/measurementFields.js";
import { fmt } from "../../utils/date.js";

function MeasurementRow({ entry, onDelete }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const values = entry.values ?? {};
  const filled = MEASUREMENT_FIELDS.filter((f) => values[f.key] !== "" && values[f.key] != null);

  return (
    <div className="bg-brand-surface2 rounded-md p-3 mb-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[13px] font-semibold text-brand-text">{fmt(entry.date)}</span>
        <button
          onClick={() => setConfirmOpen(true)}
          title="O'chirish"
          aria-label="O'chirish"
          className="bg-transparent border-none text-brand-accent2 cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {filled.length === 0 && <span className="text-xs text-brand-muted">O'lcham yo'q</span>}
        {filled.map((f) => (
          <span key={f.key} className="text-xs text-brand-muted">
            {f.label}:{" "}
            <span className="text-brand-text">
              {values[f.key]} {f.unit}
            </span>
          </span>
        ))}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="O'lchamni o'chirish"
        message={`${fmt(entry.date)} sanasidagi o'lchamlarni o'chiraymi?`}
        onConfirm={() => {
          onDelete(entry.id);
          setConfirmOpen(false);
        }}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

export default function MeasurementHistory({ items, onDelete }) {
  return (
    <Card>
      <CardTitle className="mb-3">O'lchamlar tarixi</CardTitle>
      {items.length === 0 ? (
        <div className="text-brand-muted text-[13px] text-center py-4">
          Hali o'lcham kiritilmagan.
        </div>
      ) : (
        items.map((entry) => <MeasurementRow key={entry.id} entry={entry} onDelete={onDelete} />)
      )}
    </Card>
  );
}
