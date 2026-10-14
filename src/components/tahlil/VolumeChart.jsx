import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Layers } from "lucide-react";
import { Card, CardHeader, CardTitle } from "../../ui/card.jsx";
import { SegmentedControl } from "../../ui/segmented.jsx";
import { formatCompact } from "../../utils/num.js";

const COLOR_ACCENT = "#D4FF3D";
const COLOR_LINE = "#2E2E31";
const COLOR_MUTED = "#8C8C90";
const COLOR_SURFACE2 = "#232325";
const COLOR_TEXT = "#F3F3EF";

// Volume = Weight x Reps. Ustunli grafik tanlangan: har davr alohida
// "hajm" bo'lagi, chiziq esa uzluksiz o'zgarishni anglatib qo'yardi.
const PERIODS = [
  { value: "week", label: "Haftalik" },
  { value: "month", label: "Oylik" },
];

export default function VolumeChart({ data, period, onPeriodChange }) {
  const total = data.reduce((sum, d) => sum + d.volume, 0);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 normal-case text-sm">
          <Layers size={15} /> Mashg'ulot hajmi
        </CardTitle>
        <SegmentedControl
          value={period}
          onChange={onPeriodChange}
          options={PERIODS}
          size="sm"
          className="w-[150px]"
        />
      </CardHeader>

      {data.length > 0 ? (
        <>
          <div className="text-[11px] text-brand-muted mb-1.5">
            Jami: {formatCompact(total)} kg
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data}>
              <CartesianGrid stroke={COLOR_LINE} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: COLOR_MUTED, fontSize: 10 }} />
              <YAxis
                tick={{ fill: COLOR_MUTED, fontSize: 10 }}
                tickFormatter={formatCompact}
                width={38}
              />
              <Tooltip
                cursor={{ fill: COLOR_LINE, opacity: 0.4 }}
                contentStyle={{
                  background: COLOR_SURFACE2,
                  border: `1px solid ${COLOR_LINE}`,
                  fontSize: 12,
                }}
                labelStyle={{ color: COLOR_TEXT }}
                formatter={(v, _n, item) => [
                  `${formatCompact(v)} kg · ${item.payload.count} mashg'ulot`,
                  "Hajm",
                ]}
              />
              <Bar dataKey="volume" fill={COLOR_ACCENT} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </>
      ) : (
        <div className="text-brand-muted text-xs text-center py-5">
          Ma'lumot yo'q
        </div>
      )}
    </Card>
  );
}
