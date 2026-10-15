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
import { AXIS_TICK, CHART_COLORS, PERIODS, TOOLTIP_PROPS } from "../../constants/chartTheme.js";
import { SegmentedControl } from "../../ui/segmented.jsx";

export default function MeasurementChart({
  fields,
  selectedField,
  onSelectField,
  period,
  onPeriodChange,
  data,
}) {
  const trend = computeTrend(data, "value");
  const lineColor = trend?.direction === "down" ? CHART_COLORS.accent2 : CHART_COLORS.accent;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 normal-case text-sm">
          <TrendingUp size={15} /> O'lcham dinamikasi
        </CardTitle>
        <Select value={selectedField} onChange={(e) => onSelectField(e.target.value)}>
          {fields.map((f) => (
            <option key={f.key} value={f.key}>
              {f.label}
            </option>
          ))}
        </Select>
      </CardHeader>

      <SegmentedControl
        value={period}
        onChange={onPeriodChange}
        options={PERIODS}
        className="mb-3"
      />

      {data.length > 0 ? (
        <>
          <TrendSummary trend={trend} unit="sm" />
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data}>
              <CartesianGrid stroke={CHART_COLORS.line} strokeDasharray="3 3" />
              <XAxis dataKey="period" tick={AXIS_TICK} />
              <YAxis tick={AXIS_TICK} domain={["auto", "auto"]} />
              <Tooltip {...TOOLTIP_PROPS} formatter={(v) => [`${v} sm`, "O'lcham"]} />
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
