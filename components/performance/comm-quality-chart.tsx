"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { CommQualityPoint } from "@/lib/types";
import { format } from "date-fns";

interface CommQualityChartProps {
  data: CommQualityPoint[];
}

export default function CommQualityChart({ data }: CommQualityChartProps) {
  const chartData = data.map((d) => ({
    time: format(new Date(d.timestamp), "HH:mm"),
    "Success Rate (%)": d.success_rate,
    "Latency (ms)": d.latency_ms,
    Messages: d.messages_processed,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#bbf7d0" />
        <XAxis dataKey="time" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="Success Rate (%)"
          stroke="#16a34a"
          strokeWidth={2}
          dot={false}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="Latency (ms)"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
