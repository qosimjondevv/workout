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
import { SegmentedControl } from "../../ui/segmented.jsx";

const COLOR_ACCENT = "#D4FF3D";
const COLOR_ACCENT2 = "#FF5A4E";
const COLOR_LINE = "#2E2E31";
const COLOR_MUTED = "#8C8C90";
const COLOR_SURFACE2 = "#232325";
const COLOR_TEXT = "#F3F3EF";

const PERIODS = [
  { value: "week", label: "Haftalik" },
  { value: "month", label: "Oylik" },
];

export default function MeasurementChart({
  fields,
  selectedField,
  onSelectField,
  period,
  onPeriodChange,
  data,
}) {
  const trend = computeTrend(data, "value");
  const lineColor = trend?.direction === "down" ? COLOR_ACCENT2 : COLOR_ACCENT;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5 normal-case text-sm">
          <TrendingUp size={15} /> O'lcham dinamikasi
        </CardTitle>
        <Select
          value={selectedField}
          onChange={(e) => onSelectField(e.target.value)}
        >
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
              <CartesianGrid stroke={COLOR_LINE} strokeDasharray="3 3" />
              <XAxis
                dataKey="period"
                tick={{ fill: COLOR_MUTED, fontSize: 10 }}
              />
              <YAxis
                tick={{ fill: COLOR_MUTED, fontSize: 10 }}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  background: COLOR_SURFACE2,
                  border: `1px solid ${COLOR_LINE}`,
                  fontSize: 12,
                }}
                labelStyle={{ color: COLOR_TEXT }}
                formatter={(v) => [`${v} sm`, "O'lcham"]}
              />
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
        <div className="text-brand-muted text-xs text-center py-5">
          Ma'lumot yo'q
        </div>
      )}
    </Card>
  );
}
