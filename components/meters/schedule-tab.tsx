"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { api } from "@/lib/api";
import { relativeTime, fullDateTime } from "@/lib/utils";
import type { ScheduleOut, ScheduleCreate } from "@/lib/types";
import { Calendar, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const AVAILABLE_OBJECTS = ["energy", "voltage", "current", "power", "balance"];

interface ScheduleTabProps {
  meterId: string;
}

export function ScheduleTab({ meterId }: ScheduleTabProps) {
  const [schedule, setSchedule] = useState<ScheduleOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [interval, setInterval_] = useState("30");
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(
    new Set(["energy", "balance"])
  );

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<ScheduleOut>(`/api/meters/${meterId}/schedule`);
      setSchedule(data);
      setInterval_(String(data.interval_minutes));
      setSelectedObjects(new Set(data.objects));
    } catch {
      setSchedule(null);
    } finally {
      setLoading(false);
    }
  }, [meterId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const toggleObject = (obj: string) => {
    setSelectedObjects((prev) => {
      const next = new Set(prev);
      if (next.has(obj)) next.delete(obj);
      else next.add(obj);
      return next;
    });
  };

  const handleSave = useCallback(async () => {
    if (selectedObjects.size === 0) {
      toast.error("Select at least one reading object");
      return;
    }
    setSaving(true);
    try {
      const body: ScheduleCreate = {
        interval_minutes: Number(interval),
        objects: Array.from(selectedObjects),
      };
      const result = await api<ScheduleOut>(`/api/meters/${meterId}/schedule`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      setSchedule(result);
      toast.success("Schedule saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save schedule");
    } finally {
      setSaving(false);
    }
  }, [meterId, interval, selectedObjects]);

  const handleDelete = useCallback(async () => {
    setDeleting(true);
    try {
      await api(`/api/meters/${meterId}/schedule`, { method: "DELETE" });
      setSchedule(null);
      toast.success("Schedule deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete schedule");
    } finally {
      setDeleting(false);
    }
  }, [meterId]);

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6">
      {schedule && (
        <Card className="border-[#bbf7d0]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#14532d]">
              <Calendar className="h-5 w-5 text-[#16a34a]" />
              Current Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <span className="text-[#6b7280]">Interval:</span>{" "}
                <strong className="text-[#14532d]">{schedule.interval_minutes} minutes</strong>
              </div>
              <div>
                <span className="text-[#6b7280]">Status:</span>{" "}
                <Badge
                  variant="outline"
                  className={
                    schedule.enabled
                      ? "bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]"
                      : "bg-red-50 text-[#dc2626] border-red-200"
                  }
                >
                  {schedule.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
              <div>
                <span className="text-[#6b7280]">Objects:</span>{" "}
                {schedule.objects.map((o) => (
                  <Badge key={o} variant="outline" className="mr-1 bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]">
                    {o}
                  </Badge>
                ))}
              </div>
              <div>
                <span className="text-[#6b7280]">Last Run:</span>{" "}
                <Tooltip>
                  <TooltipTrigger className="text-[#14532d] cursor-default">
                    {relativeTime(schedule.last_run)}
                  </TooltipTrigger>
                  <TooltipContent>{fullDateTime(schedule.last_run)}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-[#bbf7d0]">
        <CardHeader>
          <CardTitle className="text-[#14532d]">
            {schedule ? "Update Schedule" : "Create Schedule"}
          </CardTitle>
          <CardDescription>
            Configure automatic meter reading intervals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="interval">Interval (minutes)</Label>
            <Input
              id="interval"
              type="number"
              value={interval}
              onChange={(e) => setInterval_(e.target.value)}
              min={1}
              className="w-32"
            />
          </div>
          <div className="space-y-2">
            <Label>Reading Objects</Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_OBJECTS.map((obj) => (
                <button
                  key={obj}
                  onClick={() => toggleObject(obj)}
                  className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                    selectedObjects.has(obj)
                      ? "bg-[#16a34a] text-white border-transparent"
                      : "border-[#bbf7d0] bg-white text-[#6b7280] hover:bg-[#f0fdf4]"
                  }`}
                  aria-pressed={selectedObjects.has(obj)}
                >
                  {obj}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#16a34a] hover:bg-[#15803d]"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {schedule ? "Update" : "Create"} Schedule
            </Button>
            {schedule && (
              <ConfirmDialog
                trigger={
                  <Button variant="outline" className="border-[#dc2626] text-[#dc2626] hover:bg-red-50" disabled={deleting}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Schedule
                  </Button>
                }
                title="Delete Schedule"
                description="This will stop automatic meter readings. Are you sure?"
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={handleDelete}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
