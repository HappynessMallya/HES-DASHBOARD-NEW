"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { PerformanceCounters, CommQualityPoint } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  XCircle,
  Activity,
  Zap,
  Clock,
  Loader2,
  Calculator,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import dynamic from "next/dynamic";

const PerformanceChart = dynamic(
  () => import("@/components/performance/comm-quality-chart"),
  { ssr: false }
);

export default function PerformancePage() {
  const [counters, setCounters] = useState<PerformanceCounters | null>(null);
  const [quality, setQuality] = useState<CommQualityPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [estimateMeterCount, setEstimateMeterCount] = useState(100);
  const [estimate, setEstimate] = useState<{
    duration: number;
    rate: number;
  } | null>(null);
  const [estimating, setEstimating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [c, q] = await Promise.allSettled([
        api<PerformanceCounters>("/api/performance/counters"),
        api<CommQualityPoint[]>("/api/performance/comm-quality"),
      ]);
      if (c.status === "fulfilled") setCounters(c.value);
      if (q.status === "fulfilled") setQuality(q.value);
    } catch {
      // empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleEstimate = async () => {
    setEstimating(true);
    try {
      const data = await api<{ estimated_duration_seconds: number; estimated_success_rate: number }>(
        `/api/performance/estimate?meter_count=${estimateMeterCount}`
      );
      setEstimate({
        duration: data.estimated_duration_seconds,
        rate: data.estimated_success_rate,
      });
    } catch {
      // ignore
    } finally {
      setEstimating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Performance"
        description="Monitor task execution, communication quality, and system throughput"
      />

      {/* Task Counters */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total Tasks"
          value={counters?.total_tasks ?? 0}
          icon={Activity}
          accent="sky"
        />
        <StatCard
          label="Successful"
          value={counters?.successful_tasks ?? 0}
          icon={CheckCircle}
          accent="green"
        />
        <StatCard
          label="Failed"
          value={counters?.failed_tasks ?? 0}
          icon={XCircle}
          accent="red"
        />
        <StatCard
          label="Max Tasks/Hour"
          value={counters?.max_tasks_per_hour ?? 0}
          icon={Zap}
          accent="amber"
        />
        <StatCard
          label="Avg Execution"
          value={`${formatNumber((counters?.avg_execution_time_ms ?? 0) / 1000, 2)}s`}
          icon={Clock}
          accent="sky"
        />
      </div>

      {/* Communication Quality Chart */}
      <Card className="border-[#bbf7d0]">
        <CardHeader>
          <CardTitle className="text-[#14532d]">
            Communication Quality
          </CardTitle>
        </CardHeader>
        <CardContent>
          {quality.length > 0 ? (
            <PerformanceChart data={quality} />
          ) : (
            <div className="flex h-64 items-center justify-center text-[#6b7280]">
              No communication quality data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reading Estimator */}
      <Card className="border-[#bbf7d0]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#14532d]">
            <Calculator className="h-5 w-5" />
            Reading Performance Estimator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Number of Meters</Label>
              <Input
                type="number"
                value={estimateMeterCount}
                onChange={(e) =>
                  setEstimateMeterCount(Number(e.target.value))
                }
                min={1}
                className="w-40 border-[#bbf7d0]"
              />
            </div>
            <Button
              onClick={handleEstimate}
              disabled={estimating}
              className="bg-[#16a34a] hover:bg-[#15803d]"
            >
              {estimating && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Estimate
            </Button>
          </div>

          {estimate && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-4">
                <p className="text-sm text-[#6b7280]">Estimated Duration</p>
                <p className="text-xl font-bold text-[#14532d]">
                  {estimate.duration < 60
                    ? `${estimate.duration}s`
                    : `${Math.floor(estimate.duration / 60)}m ${estimate.duration % 60}s`}
                </p>
              </div>
              <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-4">
                <p className="text-sm text-[#6b7280]">
                  Estimated Success Rate
                </p>
                <p className="text-xl font-bold text-[#16a34a]">
                  {formatNumber(estimate.rate, 1)}%
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
