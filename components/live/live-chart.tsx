"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const SERIES_COLORS: Record<string, string> = {
  energy: "#16a34a",
  voltage: "#0ea5e9",
  current: "#f59e0b",
  power: "#8b5cf6",
  balance: "#ef4444",
};

const SERIES_UNITS: Record<string, string> = {
  energy: "kWh",
  voltage: "V",
  current: "A",
  power: "kW",
  balance: "kWh",
};

interface LiveChartProps {
  data: Record<string, unknown>[];
  selectedObjects: Set<string>;
}

export function LiveChart({ data, selectedObjects }: LiveChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#bbf7d0" />
        <XAxis dataKey="time" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <RechartTooltip />
        <Legend />
        {Array.from(selectedObjects).map((key) => {
          const color = SERIES_COLORS[key];
          const unit = SERIES_UNITS[key];
          if (!color) return null;
          return (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={`${key} (${unit})`}
              stroke={color}
              strokeWidth={2}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
