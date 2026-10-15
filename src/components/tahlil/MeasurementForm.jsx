import React from "react";
import { Ruler, Save, Weight } from "lucide-react";
import { Card, CardTitle } from "../../ui/card.jsx";
import { Input } from "../../ui/input.jsx";
import { DateField } from "../../ui/date-field.jsx";
import { Button } from "../../ui/button.jsx";
import { cn } from "../../utils/cn.js";
import {
  BODY_WEIGHT_KEY,
  CIRCUMFERENCE_FIELDS,
  measurementField,
} from "../../constants/measurementFields.js";

const LABEL = "block text-[11px] text-brand-muted mb-1";

function UnitInput({ field, value, onChange, className }) {
  return (
    <div className="relative">
      <Input
        id={`measure-${field.key}`}
        type="number"
        inputMode="decimal"
        step="0.1"
        min={field.min}
        max={field.max}
        value={value}
        onChange={(e) => onChange(field.key, e.target.value)}
        className={cn("pr-9", className)}
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-brand-muted pointer-events-none">
        {field.unit}
      </span>
    </div>
  );
}

export default function MeasurementForm({
  date,
  values,
  lastWeight,
  onDateChange,
  onValueChange,
  error,
  onSubmit,
}) {
  const weight = measurementField(BODY_WEIGHT_KEY);

  return (
    <Card className="mb-4">
      <CardTitle className="flex items-center gap-1.5 mb-3 normal-case text-sm">
        <Ruler size={15} /> Tana o'lchamlari
      </CardTitle>

      <span className={LABEL}>Sana</span>
      <DateField value={date} onChange={onDateChange} className="mb-3" />

      <label htmlFor={`measure-${weight.key}`} className={cn(LABEL, "flex items-center gap-1")}>
        <Weight size={12} /> {weight.label}
        {lastWeight !== null && (
          <span className="ml-auto text-[10px]">
            oxirgi: {lastWeight} {weight.unit}
          </span>
        )}
      </label>
      <UnitInput
        field={weight}
        value={values[weight.key]}
        onChange={onValueChange}
        className="h-11 text-base font-semibold"
      />

      <div className="text-[11px] text-brand-muted mt-4 mb-2 pb-1 border-b border-brand-line">
        Aylana o'lchamlari (sm)
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {CIRCUMFERENCE_FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={`measure-${f.key}`} className={LABEL}>
              {f.label}
            </label>
            <UnitInput field={f} value={values[f.key]} onChange={onValueChange} />
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
