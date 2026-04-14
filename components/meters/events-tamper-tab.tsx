"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { api } from "@/lib/api";
import { fullDateTime, relativeTime } from "@/lib/utils";
import type { EventOut } from "@/lib/types";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EventsTamperTabProps {
  meterId: string;
}

export function EventsTamperTab({ meterId }: EventsTamperTabProps) {
  const [events, setEvents] = useState<EventOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [eventType, setEventType] = useState("all");
  const [limit, setLimit] = useState("50");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (eventType !== "all") params.set("type", eventType);
      params.set("limit", limit);
      const data = await api<EventOut[]>(
        `/api/meters/${meterId}/events?${params.toString()}`
      );
      setEvents(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  }, [meterId, eventType, limit]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleClearTamper = useCallback(async () => {
    setClearing(true);
    try {
      const result = await api<{ status: string; local_events_cleared: number }>(
        `/api/meters/${meterId}/clear-tamper`,
        { method: "POST" }
      );
      toast.success(`Cleared ${result.local_events_cleared} tamper event(s)`);
      fetchEvents();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to clear tamper");
    } finally {
      setClearing(false);
    }
  }, [meterId, fetchEvents]);

  const getTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "tamper":
        return "bg-red-50 text-[#dc2626] border-red-200";
      case "disconnect":
        return "bg-amber-50 text-[#f59e0b] border-amber-200";
      case "connect":
        return "bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]";
      default:
        return "bg-sky-50 text-[#0ea5e9] border-sky-200";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <Label>Event Type</Label>
          <Select value={eventType} onValueChange={(v) => v !== null && setEventType(v)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="tamper">Tamper</SelectItem>
              <SelectItem value="connect">Connect</SelectItem>
              <SelectItem value="disconnect">Disconnect</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Limit</Label>
          <Select value={limit} onValueChange={(v) => v !== null && setLimit(v)}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={fetchEvents} variant="outline" disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <ConfirmDialog
          trigger={
            <Button variant="outline" className="border-[#dc2626] text-[#dc2626] hover:bg-red-50" disabled={clearing}>
              {clearing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="mr-2 h-4 w-4" />
              )}
              Clear Tamper Log
            </Button>
          }
          title="Clear Tamper Log"
          description="This will clear all tamper events from the meter's local log. Are you sure?"
          confirmLabel="Clear"
          variant="destructive"
          onConfirm={handleClearTamper}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-8 text-center">
          <p className="text-[#14532d] font-medium">No events found</p>
          <p className="text-sm text-[#6b7280] mt-1">No events match the current filter</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#bbf7d0]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#f0fdf4] hover:bg-[#f0fdf4]">
                <TableHead className="text-[#166534]">Timestamp</TableHead>
                <TableHead className="text-[#166534]">Type</TableHead>
                <TableHead className="text-[#166534]">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id} className="hover:bg-[#f0fdf4]/50">
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger className="text-[#6b7280] cursor-default text-sm">
                        {relativeTime(event.timestamp)}
                      </TooltipTrigger>
                      <TooltipContent>{fullDateTime(event.timestamp)}</TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getTypeBadgeColor(event.event_type)}>
                      {event.event_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#14532d]">
                    {event.description || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
