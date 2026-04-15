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

interface ReadingsChartProps {
  data: Record<string, unknown>[];
  visibleSeries: Set<string>;
}

const SERIES = [
  { key: "energy_kwh", label: "Energy (kWh)", color: "#16a34a" },
  { key: "voltage_v", label: "Voltage (V)", color: "#0ea5e9" },
  { key: "current_a", label: "Current (A)", color: "#f59e0b" },
  { key: "power_kw", label: "Power (kW)", color: "#8b5cf6" },
  { key: "balance_kwh", label: "Balance (kWh)", color: "#ef4444" },
] as const;

export function ReadingsChart({ data, visibleSeries }: ReadingsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#bbf7d0" />
        <XAxis dataKey="time" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <RechartTooltip />
        <Legend />
        {SERIES.map(
          (s) =>
            visibleSeries.has(s.key) && (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            )
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
