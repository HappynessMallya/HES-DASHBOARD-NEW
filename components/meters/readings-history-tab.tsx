"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatNumber, fullDateTime } from "@/lib/utils";
import type { ReadingOut } from "@/lib/types";
import { Search, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { format } from "date-fns";

const ReadingsChart = dynamic(
  () => import("@/components/meters/readings-chart").then((m) => m.ReadingsChart),
  { ssr: false }
);

interface ReadingsHistoryTabProps {
  meterId: string;
}

const SERIES = [
  { key: "energy_kwh", label: "Energy (kWh)", color: "#16a34a" },
  { key: "voltage_v", label: "Voltage (V)", color: "#0ea5e9" },
  { key: "current_a", label: "Current (A)", color: "#f59e0b" },
  { key: "power_kw", label: "Power (kW)", color: "#8b5cf6" },
  { key: "balance_kwh", label: "Balance (kWh)", color: "#ef4444" },
] as const;

export function ReadingsHistoryTab({ meterId }: ReadingsHistoryTabProps) {
  const [readings, setReadings] = useState<ReadingOut[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [limit, setLimit] = useState("50");
  const [visibleSeries, setVisibleSeries] = useState<Set<string>>(
    new Set(SERIES.map((s) => s.key))
  );

  const fetchReadings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      params.set("limit", limit);
      const data = await api<ReadingOut[]>(
        `/api/meters/${meterId}/readings?${params.toString()}`
      );
      setReadings(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch readings");
    } finally {
      setLoading(false);
    }
  }, [meterId, fromDate, toDate, limit]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const toggleSeries = (key: string) => {
    setVisibleSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const exportCsv = () => {
    if (readings.length === 0) return;
    const headers = [
      "Timestamp",
      "Energy (kWh)",
      "Voltage (V)",
      "Current (A)",
      "Power (kW)",
      "Balance (kWh)",
    ];
    const rows = readings.map((r) =>
      [
        r.timestamp,
        r.energy_kwh ?? "",
        r.voltage_v ?? "",
        r.current_a ?? "",
        r.power_kw ?? "",
        r.balance_kwh ?? "",
      ].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `readings-${meterId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartData = [...readings].reverse().map((r) => ({
    time: format(new Date(r.timestamp), "HH:mm"),
    energy_kwh: r.energy_kwh,
    voltage_v: r.voltage_v,
    current_a: r.current_a,
    power_kw: r.power_kw,
    balance_kwh: r.balance_kwh,
  }));

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <Label htmlFor="from">From</Label>
          <Input
            id="from"
            type="datetime-local"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-48"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="to">To</Label>
          <Input
            id="to"
            type="datetime-local"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-48"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="limit">Limit</Label>
          <Select value={limit} onValueChange={(v) => v !== null && setLimit(v)}>
            <SelectTrigger id="limit" className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={fetchReadings} disabled={loading} className="bg-[#16a34a] hover:bg-[#15803d]">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Search
        </Button>
        <Button variant="outline" onClick={exportCsv} disabled={readings.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Series toggles */}
      <div className="flex flex-wrap gap-2">
        {SERIES.map((s) => (
          <button
            key={s.key}
            onClick={() => toggleSeries(s.key)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              visibleSeries.has(s.key)
                ? "border-transparent text-white"
                : "border-[#bbf7d0] bg-white text-[#6b7280]"
            }`}
            style={visibleSeries.has(s.key) ? { backgroundColor: s.color } : {}}
            aria-pressed={visibleSeries.has(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {loading ? (
        <Skeleton className="h-72 w-full" />
      ) : chartData.length > 0 ? (
        <div className="rounded-lg border border-[#bbf7d0] bg-white p-4">
          <ReadingsChart data={chartData} visibleSeries={visibleSeries} />
        </div>
      ) : (
        <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-8 text-center">
          <p className="text-[#14532d] font-medium">No readings found</p>
          <p className="text-sm text-[#6b7280] mt-1">Adjust your date range or take a live reading first</p>
        </div>
      )}

      {/* Table */}
      {readings.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-[#bbf7d0]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f0fdf4] hover:bg-[#f0fdf4]">
                <TableHead className="text-[#166534]">Timestamp</TableHead>
                <TableHead className="text-[#166534]">Energy (kWh)</TableHead>
                <TableHead className="text-[#166534]">Voltage (V)</TableHead>
                <TableHead className="text-[#166534]">Current (A)</TableHead>
                <TableHead className="text-[#166534]">Power (kW)</TableHead>
                <TableHead className="text-[#166534]">Balance (kWh)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {readings.map((r) => (
                <TableRow key={r.id} className="hover:bg-[#f0fdf4]/50">
                  <TableCell className="text-[#6b7280] text-sm">
                    {fullDateTime(r.timestamp)}
                  </TableCell>
                  <TableCell>{formatNumber(r.energy_kwh)}</TableCell>
                  <TableCell>{formatNumber(r.voltage_v)}</TableCell>
                  <TableCell>{formatNumber(r.current_a, 2)}</TableCell>
                  <TableCell>{formatNumber(r.power_kw, 2)}</TableCell>
                  <TableCell>{formatNumber(r.balance_kwh)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
