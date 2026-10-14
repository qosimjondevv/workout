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
import { Dumbbell } from "lucide-react";
import { Card, CardTitle } from "../../ui/card.jsx";
import TrendSummary from "./TrendSummary.jsx";
import { computeTrend } from "../../utils/trend.js";

const COLOR_ACCENT = "#D4FF3D";
const COLOR_ACCENT2 = "#FF5A4E";
const COLOR_LINE = "#2E2E31";
const COLOR_MUTED = "#8C8C90";
const COLOR_SURFACE2 = "#232325";
const COLOR_TEXT = "#F3F3EF";

export default function BodyWeightChart({ data }) {
  const trend = computeTrend(data, "weight");
  const lineColor = trend?.direction === "down" ? COLOR_ACCENT2 : COLOR_ACCENT;

  return (
    <Card>
      <div className="flex items-center justify-between mb-2.5">
        <CardTitle className="flex items-center gap-1.5 normal-case text-sm">
          <Dumbbell size={15} /> Tana vazni
        </CardTitle>
        <TrendSummary trend={trend} unit="kg" />
      </div>

      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data}>
            <CartesianGrid stroke={COLOR_LINE} strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: COLOR_MUTED, fontSize: 10 }} />
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
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke={lineColor}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-brand-muted text-xs text-center py-5">
          Ma'lumot yo'q
        </div>
      )}
    </Card>
  );
}
