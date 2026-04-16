"use client";

import { StatCard } from "@/components/shared/stat-card";
import { MeterTable } from "@/components/meters/meter-table";
import { useMeters } from "@/lib/hooks/use-meters";
import { useGISDashboard } from "@/lib/hooks/use-gis";
import { Gauge, Wifi, WifiOff, HeartPulse, Activity, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  const { data: meters, isLoading } = useMeters();
  const { data: dashboard } = useGISDashboard();

  const meterList = meters ?? [];
  const onlineCount = dashboard?.meters.online ?? meterList.filter((m) => m.is_online).length;
  const offlineCount = dashboard?.meters.offline ?? meterList.filter((m) => !m.is_online).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#14532d]">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Meters"
          value={dashboard?.meters.total ?? meterList.length}
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
          label="Readings (24h)"
          value={dashboard?.last_24h.readings ?? "—"}
          icon={Activity}
          accent="green"
        />
      </div>

      {dashboard && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="DCUs Online"
            value={`${dashboard.dcus.online}/${dashboard.dcus.total}`}
            icon={HeartPulse}
            accent="green"
          />
          <StatCard
            label="Regions"
            value={dashboard.topology.regions}
            icon={Gauge}
            accent="green"
          />
          <StatCard
            label="Substations"
            value={dashboard.topology.substations}
            icon={Gauge}
            accent="green"
          />
          <StatCard
            label="Tamper Events (24h)"
            value={dashboard.last_24h.tamper_events}
            icon={AlertTriangle}
            accent={dashboard.last_24h.tamper_events > 0 ? "red" : "green"}
          />
        </div>
      )}

      <div>
        <h2 className="mb-4 text-lg font-semibold text-[#14532d]">Meter Overview</h2>
        <MeterTable meters={meterList} loading={isLoading} />
      </div>
    </div>
  );
}
