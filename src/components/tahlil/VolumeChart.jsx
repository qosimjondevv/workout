import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Layers } from "lucide-react";
import { Card, CardHeader, CardTitle } from "../../ui/card.jsx";
import { SegmentedControl } from "../../ui/segmented.jsx";
import { formatCompact } from "../../utils/num.js";
import { AXIS_TICK, CHART_COLORS, PERIODS, TOOLTIP_PROPS } from "../../constants/chartTheme.js";

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
          <div className="text-[11px] text-brand-muted mb-1.5">Jami: {formatCompact(total)} kg</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data}>
              <CartesianGrid stroke={CHART_COLORS.line} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={AXIS_TICK} />
              <YAxis tick={AXIS_TICK} tickFormatter={formatCompact} width={38} />
              <Tooltip
                cursor={{ fill: CHART_COLORS.line, opacity: 0.4 }}
                {...TOOLTIP_PROPS}
                formatter={(v, _n, item) => [
                  `${formatCompact(v)} kg · ${item.payload.count} mashg'ulot`,
                  "Hajm",
                ]}
              />
              <Bar dataKey="volume" fill={CHART_COLORS.accent} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </>
      ) : (
        <div className="text-brand-muted text-xs text-center py-5">Ma'lumot yo'q</div>
      )}
    </Card>
  );
}
