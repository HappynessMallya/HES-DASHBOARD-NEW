"use client";

import { StatCard } from "@/components/shared/stat-card";
import { AlertTriangle, Bell, CheckCircle, Eye } from "lucide-react";
import type { AlertOut } from "@/lib/types";

interface AlertStatsProps {
  alerts: AlertOut[];
}

export function AlertStats({ alerts }: AlertStatsProps) {
  const active = alerts.filter((a) => a.status === "active").length;
  const critical = alerts.filter(
    (a) => a.severity === "critical" && a.status === "active"
  ).length;
  const acknowledged = alerts.filter(
    (a) => a.status === "acknowledged"
  ).length;
  const resolved = alerts.filter((a) => a.status === "resolved").length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Active Alerts"
        value={active}
        icon={Bell}
        accent="red"
      />
      <StatCard
        label="Critical"
        value={critical}
        icon={AlertTriangle}
        accent="amber"
      />
      <StatCard
        label="Acknowledged"
        value={acknowledged}
        icon={Eye}
        accent="sky"
      />
      <StatCard
        label="Resolved"
        value={resolved}
        icon={CheckCircle}
        accent="green"
      />
    </div>
  );
}
