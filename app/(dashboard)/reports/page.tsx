"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { ReportOut, ReportConfig, DeviceGroup } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DateRangePicker } from "@/components/shared/date-range-picker";
import { Plus, Eye, Loader2, FileBarChart } from "lucide-react";
import { toast } from "sonner";
import { relativeTime } from "@/lib/utils";
import { format, subDays } from "date-fns";

const METRICS = [
  { key: "energy_kwh", label: "Energy (kWh)" },
  { key: "voltage_v", label: "Voltage (V)" },
  { key: "current_a", label: "Current (A)" },
  { key: "power_kw", label: "Power (kW)" },
  { key: "balance_kwh", label: "Balance (kWh)" },
];

const STATUS_STYLES: Record<string, string> = {
  generating: "bg-amber-100 text-amber-700 border-amber-200",
  ready: "bg-green-100 text-green-700 border-green-200",
  failed: "bg-red-100 text-red-700 border-red-200",
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportOut[]>([]);
  const [groups, setGroups] = useState<DeviceGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const now = new Date();
  const [form, setForm] = useState({
    name: "",
    group_id: "",
    from_date: format(subDays(now, 30), "yyyy-MM-dd"),
    to_date: format(now, "yyyy-MM-dd"),
    metrics: ["energy_kwh"] as string[],
    mode: "summary" as "summary" | "detailed",
    chart_type: "line" as "line" | "bar" | "area" | "pie",
  });

  const fetchData = useCallback(async () => {
    try {
      const [r, g] = await Promise.allSettled([
        api<ReportOut[]>("/api/reports"),
        api<DeviceGroup[]>("/api/groups"),
      ]);
      if (r.status === "fulfilled") setReports(r.value);
      if (g.status === "fulfilled") setGroups(g.value);
    } catch {
      // empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleMetric = (key: string) => {
    setForm((f) => ({
      ...f,
      metrics: f.metrics.includes(key)
        ? f.metrics.filter((m) => m !== key)
        : [...f.metrics, key],
    }));
  };

  const handleCreate = async () => {
    if (!form.name || form.metrics.length === 0) return;
    setCreating(true);

    const config: ReportConfig = {
      name: form.name,
      group_id: form.group_id || undefined,
      from_date: form.from_date,
      to_date: form.to_date,
      metrics: form.metrics,
      mode: form.mode,
      chart_type: form.chart_type,
    };

    try {
      await api("/api/reports", {
        method: "POST",
        body: JSON.stringify(config),
      });
      toast.success("Report generation started");
      setCreateOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create report");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate, view, and export utility reports for energy consumption and meter data"
        action={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger
              render={
                <Button className="bg-[#16a34a] hover:bg-[#15803d]">
                  <Plus className="mr-2 h-4 w-4" />
                  New Report
                </Button>
              }
            />
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Report Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="e.g., Monthly Energy Report"
                    className="border-[#bbf7d0]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Device Group (optional)</Label>
                  <Select
                    value={form.group_id}
                    onValueChange={(v) =>
                      setForm({ ...form, group_id: v ?? "" })
                    }
                  >
                    <SelectTrigger className="border-[#bbf7d0]">
                      <SelectValue placeholder="All meters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All meters</SelectItem>
                      {groups.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DateRangePicker
                  from={form.from_date}
                  to={form.to_date}
                  onFromChange={(v) => setForm({ ...form, from_date: v })}
                  onToChange={(v) => setForm({ ...form, to_date: v })}
                />

                <div className="space-y-2">
                  <Label>Metrics</Label>
                  <div className="space-y-2">
                    {METRICS.map((m) => (
                      <div
                        key={m.key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-[#14532d]">
                          {m.label}
                        </span>
                        <Switch
                          checked={form.metrics.includes(m.key)}
                          onCheckedChange={() => toggleMetric(m.key)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mode</Label>
                    <Select
                      value={form.mode}
                      onValueChange={(v) =>
                        setForm({
                          ...form,
                          mode: (v ?? "summary") as "summary" | "detailed",
                        })
                      }
                    >
                      <SelectTrigger className="border-[#bbf7d0]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Chart Type</Label>
                    <Select
                      value={form.chart_type}
                      onValueChange={(v) =>
                        setForm({
                          ...form,
                          chart_type: (v ?? "line") as "line" | "bar" | "area" | "pie",
                        })
                      }
                    >
                      <SelectTrigger className="border-[#bbf7d0]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="line">Line</SelectItem>
                        <SelectItem value="bar">Bar</SelectItem>
                        <SelectItem value="area">Area</SelectItem>
                        <SelectItem value="pie">Pie</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleCreate}
                  disabled={creating || !form.name || form.metrics.length === 0}
                  className="w-full bg-[#16a34a] hover:bg-[#15803d]"
                >
                  {creating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Report
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-[#bbf7d0] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f0fdf4] hover:bg-[#f0fdf4]">
                <TableHead className="text-[#14532d]">Name</TableHead>
                <TableHead className="text-[#14532d]">Status</TableHead>
                <TableHead className="text-[#14532d]">Date Range</TableHead>
                <TableHead className="text-[#14532d]">Created</TableHead>
                <TableHead className="text-[#14532d]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-8 text-center text-[#6b7280]"
                  >
                    <FileBarChart className="mx-auto mb-2 h-8 w-8 text-[#bbf7d0]" />
                    No reports generated yet
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((r) => (
                  <TableRow key={r.id} className="hover:bg-[#f0fdf4]/50">
                    <TableCell className="font-medium text-[#14532d]">
                      {r.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={STATUS_STYLES[r.status] || ""}
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-[#6b7280]">
                      {r.config.from_date} — {r.config.to_date}
                    </TableCell>
                    <TableCell className="text-sm text-[#6b7280]">
                      {relativeTime(r.created_at)}
                    </TableCell>
                    <TableCell>
                      {r.status === "ready" && (
                        <Link href={`/reports/${r.id}`}>
                          <Button variant="ghost" size="icon-xs" title="View">
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
