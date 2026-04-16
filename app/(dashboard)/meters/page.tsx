"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MeterTable } from "@/components/meters/meter-table";
import { RegisterMeterDialog } from "@/components/meters/register-meter-dialog";
import { useMeters, useDeleteMeter } from "@/lib/hooks/use-meters";
import type { MeterOut } from "@/lib/types";
import { Search } from "lucide-react";
import { toast } from "sonner";

export default function MetersPage() {
  const { data: meters, isLoading } = useMeters();
  const deleteMeter = useDeleteMeter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteMeter.mutateAsync(id);
        toast.success("Meter deleted");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete meter");
      }
    },
    [deleteMeter]
  );

  const meterList = meters ?? [];
  const filtered = meterList.filter((m) => {
    const matchSearch =
      !search || m.serial_number.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "online" && m.is_online) ||
      (statusFilter === "offline" && !m.is_online);
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#14532d]">Meter Management</h1>
        <RegisterMeterDialog onCreated={() => {}} />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
          <Input
            placeholder="Search by serial number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search meters"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => v !== null && setStatusFilter(v)}>
          <SelectTrigger className="w-36" aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <MeterTable
        meters={filtered}
        loading={isLoading}
        showDelete
        showCreatedAt
        onDelete={handleDelete}
      />
    </div>
  );
}
