import React from "react";
import { PieChart as PieIcon } from "lucide-react";
import { Card, CardTitle } from "../../ui/card.jsx";

export default function MuscleDistribution({ data }) {
  const max = data.length ? data[0].percent : 0;

  return (
    <Card className="mb-4">
      <CardTitle className="flex items-center gap-1.5 mb-3 normal-case text-sm">
        <PieIcon size={15} /> Mushak guruhlari
      </CardTitle>

      {data.length === 0 ? (
        <div className="text-brand-muted text-xs text-center py-5">Ma'lumot yo'q</div>
      ) : (
        <div className="flex flex-col gap-2">
          {data.map((d) => (
            <div key={d.key}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-brand-text">{d.label}</span>
                <span className="text-brand-muted">
                  {d.percent}% · {d.value} set
                </span>
              </div>
              <div className="h-1.5 bg-brand-surface2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-accent rounded-full"
                  style={{ width: `${max ? (d.percent / max) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
