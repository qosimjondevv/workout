import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle } from "../../ui/card.jsx";
import { Select } from "../../ui/select.jsx";
import TrendSummary from "./TrendSummary.jsx";
import { computeTrend } from "../../utils/trend.js";
import { AXIS_TICK, CHART_COLORS, TOOLTIP_PROPS } from "../../constants/chartTheme.js";

export default function ExerciseChart({
  exerciseNames,
  selectedExercise,
  onSelectExercise,
  unit,
  data,
}) {
  const unitLabel = unit === "seconds" ? "soniya" : "kg";
  const trend = computeTrend(data, "value");
  const lineColor = trend?.direction === "down" ? CHART_COLORS.accent2 : CHART_COLORS.accent;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 normal-case text-sm">
          <TrendingUp size={15} /> Mashq progressi
        </CardTitle>
        <Select value={selectedExercise} onChange={(e) => onSelectExercise(e.target.value)}>
          {exerciseNames.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </Select>
      </CardHeader>

      {data.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-1.5">
            <div className="text-[10px] text-brand-muted">Birlik: {unitLabel}</div>
            <TrendSummary trend={trend} unit={unitLabel} />
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data}>
              <CartesianGrid stroke={CHART_COLORS.line} strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={AXIS_TICK} />
              <YAxis tick={AXIS_TICK} />
              <Tooltip {...TOOLTIP_PROPS} formatter={(v) => [`${v} ${unitLabel}`, "Natija"]} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={lineColor}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      ) : (
        <div className="text-brand-muted text-xs text-center py-5">Ma'lumot yo'q</div>
      )}
    </Card>
  );
}
