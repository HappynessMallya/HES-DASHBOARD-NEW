"use client";

import {
  LineChart,
  BarChart,
  AreaChart,
  PieChart,
  Line,
  Bar,
  Area,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#16a34a", "#0ea5e9", "#f59e0b", "#8b5cf6", "#ef4444"];

interface ReportChartProps {
  data: Record<string, unknown>[];
  chartType: string;
  metrics: string[];
}

export default function ReportChart({
  data,
  chartType,
  metrics,
}: ReportChartProps) {
  const timeKey =
    Object.keys(data[0] || {}).find(
      (k) => k === "timestamp" || k === "time" || k === "date"
    ) || Object.keys(data[0] || {})[0];

  if (chartType === "pie" && metrics.length > 0) {
    const metric = metrics[0];
    const pieData = data.slice(0, 10).map((d, i) => ({
      name: String(d[timeKey] || `Item ${i}`),
      value: Number(d[metric] || 0),
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {pieData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  const ChartComponent =
    chartType === "bar" ? BarChart : chartType === "area" ? AreaChart : LineChart;
  const DataComponent =
    chartType === "bar" ? Bar : chartType === "area" ? Area : Line;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ChartComponent data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#bbf7d0" />
        <XAxis dataKey={timeKey} tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        {metrics.map((metric, i) => (
          <DataComponent
            key={metric}
            type="monotone"
            dataKey={metric}
            stroke={COLORS[i % COLORS.length]}
            fill={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={false}
            fillOpacity={chartType === "area" ? 0.3 : 1}
          />
        ))}
      </ChartComponent>
    </ResponsiveContainer>
  );
}
