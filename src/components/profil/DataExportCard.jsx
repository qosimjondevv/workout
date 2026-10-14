import React from "react";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import { Card, CardTitle } from "../../ui/card.jsx";
import { Button } from "../../ui/button.jsx";

// Ma'lumotni yuklab olish. Uchala tugma ham faqat QURILMADAGI (keshdagi)
// ma'lumotdan fayl yasaydi — internet shart emas.
export default function DataExportCard({ counts, onExportJson, onExportWorkoutsCsv, onExportMeasurementsCsv }) {
  return (
    <Card className="mb-4">
      <CardTitle className="flex items-center gap-1.5 mb-1 normal-case text-sm">
        <Download size={15} /> Ma'lumotlarni yuklab olish
      </CardTitle>
      <div className="text-[11px] text-brand-muted mb-3">
        {counts.workouts} mashg'ulot · {counts.measurements} o'lchov · {counts.templates} kunlik mashq
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="secondary" onClick={onExportJson} className="justify-start">
          <FileJson size={15} className="text-brand-accent" />
          <span className="flex-1 text-left">To'liq zaxira (JSON)</span>
        </Button>
        <Button
          variant="secondary"
          onClick={onExportWorkoutsCsv}
          disabled={counts.workouts === 0}
          className="justify-start"
        >
          <FileSpreadsheet size={15} className="text-brand-accent" />
          <span className="flex-1 text-left">Mashg'ulotlar (CSV, Excel)</span>
        </Button>
        <Button
          variant="secondary"
          onClick={onExportMeasurementsCsv}
          disabled={counts.measurements === 0}
          className="justify-start"
        >
          <FileSpreadsheet size={15} className="text-brand-accent" />
          <span className="flex-1 text-left">Tana o'lchamlari (CSV)</span>
        </Button>
      </div>
    </Card>
  );
}
