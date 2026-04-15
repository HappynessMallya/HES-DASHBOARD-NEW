"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusDot } from "@/components/shared/status-dot";
import { MeterOverviewTab } from "@/components/meters/meter-overview-tab";
import { ReadingsHistoryTab } from "@/components/meters/readings-history-tab";
import { TokenCreditTab } from "@/components/meters/token-credit-tab";
import { EventsTamperTab } from "@/components/meters/events-tamper-tab";
import { RelayControlTab } from "@/components/meters/relay-control-tab";
import { ScheduleTab } from "@/components/meters/schedule-tab";
import { TimeSyncTab } from "@/components/meters/time-sync-tab";
import { ConfigTab } from "@/components/meters/config-tab";
import { api } from "@/lib/api";
import { relativeTime, fullDateTime } from "@/lib/utils";
import type { MeterOut } from "@/lib/types";
import {
  BarChart3,
  History,
  CreditCard,
  Bell,
  Power,
  Calendar,
  Clock,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function MeterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [meter, setMeter] = useState<MeterOut | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMeter = useCallback(async () => {
    try {
      const data = await api<MeterOut>(`/api/meters/${id}`);
      setMeter(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load meter");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMeter();
  }, [fetchMeter]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!meter) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg font-medium text-[#14532d]">Meter not found</p>
        <p className="text-sm text-[#6b7280]">The requested meter could not be loaded</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#14532d]">{meter.serial_number}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#6b7280]">
            <span className="flex items-center gap-1.5">
              <StatusDot online={meter.is_online} />
              <span className={meter.is_online ? "text-[#16a34a]" : "text-[#dc2626]"}>
                {meter.is_online ? "Online" : "Offline"}
              </span>
            </span>
            <span className="font-mono">
              {meter.ip_address || "No IP"}:{meter.port}
            </span>
            <Badge variant="outline" className="bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]">
              {meter.security_level}
            </Badge>
            <Tooltip>
              <TooltipTrigger className="cursor-default">
                Last seen: {relativeTime(meter.last_seen)}
              </TooltipTrigger>
              <TooltipContent>{fullDateTime(meter.last_seen)}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-[#f0fdf4] p-1">
          <TabsTrigger value="overview" className="gap-1.5 data-[state=active]:bg-[#16a34a] data-[state=active]:text-white">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="readings" className="gap-1.5 data-[state=active]:bg-[#16a34a] data-[state=active]:text-white">
            <History className="h-4 w-4" />
            Readings
          </TabsTrigger>
          <TabsTrigger value="token" className="gap-1.5 data-[state=active]:bg-[#16a34a] data-[state=active]:text-white">
            <CreditCard className="h-4 w-4" />
            Token & Credit
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-1.5 data-[state=active]:bg-[#16a34a] data-[state=active]:text-white">
            <Bell className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="relay" className="gap-1.5 data-[state=active]:bg-[#16a34a] data-[state=active]:text-white">
            <Power className="h-4 w-4" />
            Relay
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-1.5 data-[state=active]:bg-[#16a34a] data-[state=active]:text-white">
            <Calendar className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="timesync" className="gap-1.5 data-[state=active]:bg-[#16a34a] data-[state=active]:text-white">
            <Clock className="h-4 w-4" />
            Time Sync
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-1.5 data-[state=active]:bg-[#16a34a] data-[state=active]:text-white">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview">
            <MeterOverviewTab meterId={id} />
          </TabsContent>
          <TabsContent value="readings">
            <ReadingsHistoryTab meterId={id} />
          </TabsContent>
          <TabsContent value="token">
            <TokenCreditTab meterId={id} />
          </TabsContent>
          <TabsContent value="events">
            <EventsTamperTab meterId={id} />
          </TabsContent>
          <TabsContent value="relay">
            <RelayControlTab meterId={id} />
          </TabsContent>
          <TabsContent value="schedule">
            <ScheduleTab meterId={id} />
          </TabsContent>
          <TabsContent value="timesync">
            <TimeSyncTab meterId={id} />
          </TabsContent>
          <TabsContent value="config">
            <ConfigTab meterId={id} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
