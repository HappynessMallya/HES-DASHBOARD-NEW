"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { MDMSStatus } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressBar } from "@/components/shared/progress-bar";
import {
  Network,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  Shield,
  Clock,
} from "lucide-react";
import { relativeTime } from "@/lib/utils";

const INTERFACE_STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  inactive: "bg-gray-100 text-gray-700 border-gray-200",
  error: "bg-red-100 text-red-700 border-red-200",
};

export default function MDMSPage() {
  const [status, setStatus] = useState<MDMSStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await api<MDMSStatus>("/api/mdms/status");
      setStatus(data);
    } catch {
      // empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30_000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="MDMS Interface"
        description="Monitor integration status with Meter Data Management System via CIM protocol"
      />

      {/* Status Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Connection Status"
          value={status?.connected ? "Connected" : "Disconnected"}
          icon={status?.connected ? CheckCircle : XCircle}
          accent={status?.connected ? "green" : "red"}
        />
        <StatCard
          label="Records Sent (24h)"
          value={status?.records_sent_24h ?? 0}
          icon={ArrowUpDown}
          accent="sky"
        />
        <StatCard
          label="Records Failed (24h)"
          value={status?.records_failed_24h ?? 0}
          icon={XCircle}
          accent="red"
        />
        <StatCard
          label="Last Sync"
          value={status?.last_sync ? relativeTime(status.last_sync) : "Never"}
          icon={Clock}
          accent="amber"
        />
      </div>

      {/* CIM Compliance */}
      <Card className="border-[#bbf7d0]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#14532d]">
            <Shield className="h-5 w-5" />
            CIM Protocol Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <ProgressBar
                value={status?.cim_compliance_score ?? 0}
                label="Compliance Score"
              />
            </div>
            <Badge
              variant="outline"
              className={
                (status?.cim_compliance_score ?? 0) >= 90
                  ? "bg-green-100 text-green-700 border-green-200"
                  : (status?.cim_compliance_score ?? 0) >= 70
                    ? "bg-amber-100 text-amber-700 border-amber-200"
                    : "bg-red-100 text-red-700 border-red-200"
              }
            >
              {status?.interface_health ?? "unknown"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Interface Health Table */}
      <Card className="border-[#bbf7d0]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#14532d]">
            <Network className="h-5 w-5" />
            Interface Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-[#bbf7d0] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f0fdf4] hover:bg-[#f0fdf4]">
                  <TableHead className="text-[#14532d]">Interface</TableHead>
                  <TableHead className="text-[#14532d]">Type</TableHead>
                  <TableHead className="text-[#14532d]">Status</TableHead>
                  <TableHead className="text-[#14532d]">
                    Messages Today
                  </TableHead>
                  <TableHead className="text-[#14532d]">
                    Last Activity
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(status?.interfaces ?? []).length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-8 text-center text-[#6b7280]"
                    >
                      No interfaces configured
                    </TableCell>
                  </TableRow>
                ) : (
                  status!.interfaces.map((iface, i) => (
                    <TableRow key={i} className="hover:bg-[#f0fdf4]/50">
                      <TableCell className="font-medium text-[#14532d]">
                        {iface.name}
                      </TableCell>
                      <TableCell className="text-sm">{iface.type}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            INTERFACE_STATUS_STYLES[iface.status] || ""
                          }
                        >
                          {iface.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{iface.messages_today}</TableCell>
                      <TableCell className="text-sm text-[#6b7280]">
                        {relativeTime(iface.last_activity)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
