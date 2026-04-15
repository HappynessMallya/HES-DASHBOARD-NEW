"use client";

import { useState, useCallback } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { relativeTime } from "@/lib/utils";
import type { AlertOut, AlertSeverity, AlertStatus } from "@/lib/types";

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  info: "bg-sky-100 text-sky-700 border-sky-200",
};

const STATUS_STYLES: Record<AlertStatus, string> = {
  active: "bg-red-100 text-red-700 border-red-200",
  acknowledged: "bg-amber-100 text-amber-700 border-amber-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
};

interface AlertTableProps {
  alerts: AlertOut[];
  loading: boolean;
  onRefresh: () => void;
}

export function AlertTable({ alerts, loading, onRefresh }: AlertTableProps) {
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = alerts.filter((a) => {
    if (severityFilter !== "all" && a.severity !== severityFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    return true;
  });

  const alertTypes = [...new Set(alerts.map((a) => a.type))];

  const handleAction = useCallback(
    async (alertId: string, action: "acknowledge" | "resolve") => {
      try {
        await api(`/api/alerts/${alertId}/${action}`, { method: "POST" });
        toast.success(
          action === "acknowledge"
            ? "Alert acknowledged"
            : "Alert resolved"
        );
        onRefresh();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : `Failed to ${action} alert`
        );
      }
    },
    [onRefresh]
  );

  const formatDuration = (seconds: number | null) => {
    if (seconds === null) return "—";
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400)
      return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-[#6b7280]">
            Severity
          </label>
          <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v ?? "all")}>
            <SelectTrigger className="w-32 border-[#bbf7d0]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[#6b7280]">
            Status
          </label>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-36 border-[#bbf7d0]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {alertTypes.length > 0 && (
          <div>
            <label className="mb-1 block text-xs font-medium text-[#6b7280]">
              Type
            </label>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
              <SelectTrigger className="w-40 border-[#bbf7d0]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {alertTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#bbf7d0] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#f0fdf4] hover:bg-[#f0fdf4]">
              <TableHead className="text-[#14532d]">Meter</TableHead>
              <TableHead className="text-[#14532d]">Type</TableHead>
              <TableHead className="text-[#14532d]">Severity</TableHead>
              <TableHead className="text-[#14532d]">Status</TableHead>
              <TableHead className="text-[#14532d]">Message</TableHead>
              <TableHead className="text-[#14532d]">Created</TableHead>
              <TableHead className="text-[#14532d]">Duration</TableHead>
              <TableHead className="text-[#14532d]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-[#6b7280]"
                >
                  No alerts found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((alert) => (
                <TableRow key={alert.id} className="hover:bg-[#f0fdf4]/50">
                  <TableCell className="font-mono text-sm">
                    {alert.serial_number}
                  </TableCell>
                  <TableCell className="capitalize">
                    {alert.type.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={SEVERITY_STYLES[alert.severity]}
                    >
                      {alert.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={STATUS_STYLES[alert.status]}
                    >
                      {alert.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm">
                    {alert.message}
                  </TableCell>
                  <TableCell className="text-sm text-[#6b7280]">
                    {relativeTime(alert.created_at)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDuration(alert.duration_seconds)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {alert.status === "active" && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() =>
                            handleAction(alert.id, "acknowledge")
                          }
                          title="Acknowledge"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {alert.status !== "resolved" && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleAction(alert.id, "resolve")}
                          title="Resolve"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
