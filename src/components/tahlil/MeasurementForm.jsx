import React from "react";
import { Ruler, Save } from "lucide-react";
import { Card, CardTitle } from "../../ui/card.jsx";
import { Input } from "../../ui/input.jsx";
import { DateField } from "../../ui/date-field.jsx";
import { Button } from "../../ui/button.jsx";
import { MEASUREMENT_FIELDS } from "../../constants/measurementFields.js";

export default function MeasurementForm({
  date,
  values,
  onDateChange,
  onValueChange,
  error,
  onSubmit,
}) {
  return (
    <Card className="mb-4">
      <CardTitle className="flex items-center gap-1.5 mb-3 normal-case text-sm">
        <Ruler size={15} /> Tana o'lchamlari (sm)
      </CardTitle>

      <label className="text-[11px] text-brand-muted">Sana</label>
      <DateField value={date} onChange={onDateChange} className="mt-1 mb-3" />

      <div className="grid grid-cols-2 gap-2 mb-3">
        {MEASUREMENT_FIELDS.map((f) => (
          <div key={f.key}>
            <label className="text-[11px] text-brand-muted">{f.label}</label>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="sm"
              value={values[f.key]}
              onChange={(e) => onValueChange(f.key, e.target.value)}
              className="mt-1"
            />
          </div>
        ))}
      </div>

      {error && <div className="text-brand-accent2 text-xs mb-2">{error}</div>}

      <Button onClick={onSubmit} className="w-full font-display uppercase tracking-wide text-sm">
        <Save size={16} /> Saqlash
      </Button>
    </Card>
  );
}
