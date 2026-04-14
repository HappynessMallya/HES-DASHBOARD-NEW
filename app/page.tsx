"use client";

import { useState, useEffect, useCallback } from "react";
import { StatCard } from "@/components/shared/stat-card";
import { MeterTable } from "@/components/meters/meter-table";
import { api } from "@/lib/api";
import type { MeterOut, HealthResponse } from "@/lib/types";
import { Gauge, Wifi, WifiOff, HeartPulse } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const [meters, setMeters] = useState<MeterOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState<"healthy" | "down" | "checking">("checking");

  const fetchData = useCallback(async () => {
    try {
      const [metersData, health] = await Promise.allSettled([
        api<MeterOut[]>("/api/meters"),
        api<HealthResponse>("/health"),
      ]);

      if (metersData.status === "fulfilled") {
        setMeters(metersData.value);
      } else {
        toast.error("Failed to fetch meters");
      }

      setHealthStatus(
        health.status === "fulfilled" ? "healthy" : "down"
      );
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const onlineCount = meters.filter((m) => m.is_online).length;
  const offlineCount = meters.filter((m) => !m.is_online).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#14532d]">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Meters"
          value={meters.length}
          icon={Gauge}
          accent="green"
        />
        <StatCard
          label="Online Now"
          value={onlineCount}
          icon={Wifi}
          accent="green"
        />
        <StatCard
          label="Offline"
          value={offlineCount}
          icon={WifiOff}
          accent="red"
        />
        <StatCard
          label="API Health"
          value={
            healthStatus === "checking"
              ? "Checking..."
              : healthStatus === "healthy"
              ? "Healthy"
              : "Down"
          }
          icon={HeartPulse}
          accent={healthStatus === "healthy" ? "green" : healthStatus === "down" ? "red" : "amber"}
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-[#14532d]">Meter Overview</h2>
        <MeterTable meters={meters} loading={loading} />
      </div>
    </div>
  );
}
