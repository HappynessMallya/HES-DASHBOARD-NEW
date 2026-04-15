"use client";

import { useState, useEffect, useCallback } from "react";
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
import { api } from "@/lib/api";
import type { MeterOut } from "@/lib/types";
import { Search } from "lucide-react";
import { toast } from "sonner";

export default function MetersPage() {
  const [meters, setMeters] = useState<MeterOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchMeters = useCallback(async () => {
    try {
      const data = await api<MeterOut[]>("/api/meters");
      setMeters(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch meters");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeters();
  }, [fetchMeters]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await api(`/api/meters/${id}`, { method: "DELETE" });
        toast.success("Meter deleted");
        setMeters((prev) => prev.filter((m) => m.id !== id));
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to delete meter");
      }
    },
    []
  );

  const handleCreated = useCallback(
    (meter: MeterOut) => {
      setMeters((prev) => [meter, ...prev]);
    },
    []
  );

  const filtered = meters.filter((m) => {
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
        <RegisterMeterDialog onCreated={handleCreated} />
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
        loading={loading}
        showDelete
        showCreatedAt
        onDelete={handleDelete}
      />
    </div>
  );
}
