"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { DeviceLocation, DCULocation } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

const DeviceMap = dynamic(() => import("@/components/map/device-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-[600px] w-full rounded-lg" />,
});

export default function MapPage() {
  const [meters, setMeters] = useState<DeviceLocation[]>([]);
  const [dcus, setDCUs] = useState<DCULocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMeters, setShowMeters] = useState(true);
  const [showDCUs, setShowDCUs] = useState(true);
  const [showConnections, setShowConnections] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [m, d] = await Promise.allSettled([
        api<DeviceLocation[]>("/api/map/meters"),
        api<DCULocation[]>("/api/map/dcus"),
      ]);
      if (m.status === "fulfilled") setMeters(m.value);
      if (d.status === "fulfilled") setDCUs(d.value);
    } catch {
      // empty map
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onlineCount = meters.filter((m) => m.is_online).length;
  const offlineCount = meters.filter((m) => !m.is_online).length;

  return (
    <div className="space-y-4">
      <PageHeader
        title="GIS Map"
        description="Geographic view of meters, data concentrators, and network connections"
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={showMeters} onCheckedChange={setShowMeters} />
            <Label className="text-sm">Meters</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={showDCUs} onCheckedChange={setShowDCUs} />
            <Label className="text-sm">Data Concentrators</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={showConnections}
              onCheckedChange={setShowConnections}
            />
            <Label className="text-sm">Connections</Label>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge
            variant="outline"
            className="bg-green-100 text-green-700 border-green-200"
          >
            {onlineCount} online
          </Badge>
          <Badge
            variant="outline"
            className="bg-red-100 text-red-700 border-red-200"
          >
            {offlineCount} offline
          </Badge>
          <Badge
            variant="outline"
            className="bg-sky-100 text-sky-700 border-sky-200"
          >
            {dcus.length} DCUs
          </Badge>
        </div>
      </div>

      {/* Map */}
      <Card className="border-[#bbf7d0] overflow-hidden">
        <CardContent className="p-0">
          <div className="h-[600px]">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <DeviceMap
                meters={meters}
                dcus={dcus}
                showMeters={showMeters}
                showDCUs={showDCUs}
                showConnections={showConnections}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
