"use client";

import { useState, useEffect, useCallback } from "react";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import type { ReadingOut, LiveReadResponse } from "@/lib/types";
import { Zap, Activity, Gauge, Power, Wallet, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MeterOverviewTabProps {
  meterId: string;
}

export function MeterOverviewTab({ meterId }: MeterOverviewTabProps) {
  const [reading, setReading] = useState<ReadingOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLatest = useCallback(async () => {
    try {
      const readings = await api<ReadingOut[]>(
        `/api/meters/${meterId}/readings?last=true`
      );
      setReading(readings.length > 0 ? readings[0] : null);
    } catch {
      // No readings yet
    } finally {
      setLoading(false);
    }
  }, [meterId]);

  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const live = await api<LiveReadResponse>(`/api/meters/${meterId}/read`, {
        method: "POST",
        body: JSON.stringify({
          objects: ["energy", "voltage", "current", "power", "balance"],
        }),
      });
      toast.success("Reading refreshed");
      // Re-fetch latest from history
      await fetchLatest();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to read meter");
    } finally {
      setRefreshing(false);
    }
  }, [meterId, fetchLatest]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#14532d]">Latest Readings</h3>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-[#16a34a] hover:bg-[#15803d]"
        >
          {refreshing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh Reading
        </Button>
      </div>

      {!reading ? (
        <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-8 text-center">
          <p className="text-[#14532d] font-medium">No readings available yet</p>
          <p className="text-sm text-[#6b7280] mt-1">Click &quot;Refresh Reading&quot; to take a live reading</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Energy"
            value={formatNumber(reading.energy_kwh)}
            unit="kWh"
            icon={Zap}
            accent="green"
          />
          <StatCard
            label="Voltage"
            value={formatNumber(reading.voltage_v)}
            unit="V"
            icon={Activity}
            accent="sky"
          />
          <StatCard
            label="Current"
            value={formatNumber(reading.current_a, 2)}
            unit="A"
            icon={Gauge}
            accent="amber"
          />
          <StatCard
            label="Power"
            value={formatNumber(reading.power_kw, 2)}
            unit="kW"
            icon={Power}
            accent="green"
          />
          <StatCard
            label="Balance"
            value={formatNumber(reading.balance_kwh)}
            unit="kWh"
            icon={Wallet}
            accent={
              reading.balance_kwh !== null && reading.balance_kwh !== undefined && reading.balance_kwh < 5
                ? "amber"
                : "green"
            }
          />
        </div>
      )}
    </div>
  );
}
