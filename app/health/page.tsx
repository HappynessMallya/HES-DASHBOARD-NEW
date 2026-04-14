"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { HealthResponse } from "@/lib/types";
import { HeartPulse, CheckCircle, XCircle, RefreshCw } from "lucide-react";

export default function HealthPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const data = await api<HealthResponse>("/health");
      setHealth(data);
      setError(false);
    } catch {
      setHealth(null);
      setError(true);
    }
    setLastChecked(new Date());
  }, []);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const isHealthy = health && !error;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#14532d]">System Health</h1>

      <Card className="border-[#bbf7d0] max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#14532d]">
            <HeartPulse className="h-5 w-5 text-[#16a34a]" />
            API Health Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              {isHealthy ? (
                <>
                  <CheckCircle className="mx-auto h-16 w-16 text-[#16a34a]" />
                  <p className="mt-4 text-2xl font-bold text-[#16a34a]">Healthy</p>
                </>
              ) : (
                <>
                  <XCircle className="mx-auto h-16 w-16 text-[#dc2626]" />
                  <p className="mt-4 text-2xl font-bold text-[#dc2626]">Down</p>
                </>
              )}
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between rounded-lg bg-[#f0fdf4] px-4 py-2">
              <span className="text-[#6b7280]">Service</span>
              <span className="font-medium text-[#14532d]">
                {health?.service || "Unknown"}
              </span>
            </div>
            <div className="flex justify-between rounded-lg bg-[#f0fdf4] px-4 py-2">
              <span className="text-[#6b7280]">Status</span>
              <span className="font-medium text-[#14532d]">
                {health?.status || "Unreachable"}
              </span>
            </div>
            <div className="flex justify-between rounded-lg bg-[#f0fdf4] px-4 py-2">
              <span className="text-[#6b7280]">Last Checked</span>
              <span className="flex items-center gap-1 font-medium text-[#14532d]">
                <RefreshCw className="h-3 w-3 animate-spin text-[#6b7280]" />
                {lastChecked ? lastChecked.toLocaleTimeString() : "—"}
              </span>
            </div>
            <p className="text-xs text-center text-[#6b7280]">
              Auto-refreshing every 10 seconds
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
