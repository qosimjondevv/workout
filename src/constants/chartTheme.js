export const CHART_COLORS = {
  accent: "#D4FF3D",
  accent2: "#FF5A4E",
  line: "#2E2E31",
  muted: "#8C8C90",
  surface2: "#232325",
  text: "#F3F3EF",
};

export const AXIS_TICK = { fill: CHART_COLORS.muted, fontSize: 10 };

export const TOOLTIP_PROPS = {
  contentStyle: {
    background: CHART_COLORS.surface2,
    border: `1px solid ${CHART_COLORS.line}`,
    fontSize: 12,
  },
  labelStyle: { color: CHART_COLORS.text },
};

export const PERIODS = [
  { value: "week", label: "Haftalik" },
  { value: "month", label: "Oylik" },
];
