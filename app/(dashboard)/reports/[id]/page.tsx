"use client";

import { use, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { ReportOut } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { ExportMenu } from "@/components/shared/export-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { downloadCSV, downloadJSON, downloadFromBackend } from "@/lib/export";
import dynamic from "next/dynamic";

const ReportChart = dynamic(
  () => import("@/components/reports/report-chart"),
  { ssr: false }
);

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [report, setReport] = useState<ReportOut | null>(null);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async () => {
    try {
      const [r, d] = await Promise.all([
        api<ReportOut>(`/api/reports/${id}`),
        api<Record<string, unknown>[]>(`/api/reports/${id}/data`),
      ]);
      setReport(r);
      setData(d);
    } catch {
      toast.error("Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExport = async (format: string) => {
    if (!report) return;
    const filename = report.name.replace(/\s+/g, "_").toLowerCase();

    try {
      if (format === "csv") {
        downloadCSV(data, filename);
      } else if (format === "json") {
        downloadJSON(data, filename);
      } else {
        await downloadFromBackend(
          `/api/reports/${id}/export?format=${format}`,
          `${filename}.${format}`
        );
      }
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch {
      toast.error("Export failed");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="py-12 text-center text-[#6b7280]">Report not found</div>
    );
  }

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={report.name}
        description={`${report.config.from_date} to ${report.config.to_date} | ${report.config.mode} mode`}
        action={<ExportMenu onExport={handleExport} />}
      />

      <div className="flex gap-2">
        <Badge
          variant="outline"
          className="bg-green-100 text-green-700 border-green-200"
        >
          {report.status}
        </Badge>
        <Badge variant="outline" className="bg-sky-100 text-sky-700 border-sky-200">
          {report.config.chart_type} chart
        </Badge>
        <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
          {report.config.metrics.length} metrics
        </Badge>
      </div>

      {/* Chart */}
      <Card className="border-[#bbf7d0]">
        <CardHeader>
          <CardTitle className="text-[#14532d]">Chart View</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <ReportChart
              data={data}
              chartType={report.config.chart_type}
              metrics={report.config.metrics}
            />
          ) : (
            <div className="flex h-48 items-center justify-center text-[#6b7280]">
              No data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card className="border-[#bbf7d0]">
        <CardHeader>
          <CardTitle className="text-[#14532d]">Data Table</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-[#bbf7d0] overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f0fdf4] hover:bg-[#f0fdf4]">
                  {columns.map((col) => (
                    <TableHead key={col} className="text-[#14532d]">
                      {col.replace(/_/g, " ")}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.slice(0, 50).map((row, i) => (
                  <TableRow key={i} className="hover:bg-[#f0fdf4]/50">
                    {columns.map((col) => (
                      <TableCell key={col} className="text-sm">
                        {String(row[col] ?? "—")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {data.length > 50 && (
            <p className="mt-2 text-sm text-[#6b7280]">
              Showing 50 of {data.length} rows. Export for full data.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
