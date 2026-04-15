"use client";

import { use, useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { DeviceGroup, MeterOut } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { GroupMembersTable } from "@/components/groups/group-members-table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [group, setGroup] = useState<DeviceGroup | null>(null);
  const [meters, setMeters] = useState<MeterOut[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [groupData, metersData] = await Promise.all([
        api<DeviceGroup>(`/api/groups/${id}`),
        api<MeterOut[]>(`/api/groups/${id}/meters`),
      ]);
      setGroup(groupData);
      setMeters(metersData);
    } catch {
      toast.error("Failed to load group details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRemove = async (meterId: string) => {
    try {
      await api(`/api/groups/${id}/meters/${meterId}`, { method: "DELETE" });
      toast.success("Meter removed from group");
      fetchData();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove meter"
      );
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="py-12 text-center text-[#6b7280]">Group not found</div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={group.name}
        description={group.description || undefined}
        action={
          <Badge
            variant="outline"
            className={
              group.type === "static"
                ? "bg-sky-100 text-sky-700 border-sky-200"
                : "bg-purple-100 text-purple-700 border-purple-200"
            }
          >
            {group.type} group
          </Badge>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-4">
          <p className="text-sm text-[#6b7280]">Members</p>
          <p className="text-2xl font-bold text-[#14532d]">
            {group.member_count}
          </p>
        </div>
        <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-4">
          <p className="text-sm text-[#6b7280]">Online</p>
          <p className="text-2xl font-bold text-[#16a34a]">
            {meters.filter((m) => m.is_online).length}
          </p>
        </div>
        <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-4">
          <p className="text-sm text-[#6b7280]">Offline</p>
          <p className="text-2xl font-bold text-red-600">
            {meters.filter((m) => !m.is_online).length}
          </p>
        </div>
      </div>

      <GroupMembersTable
        meters={meters}
        loading={false}
        onRemove={handleRemove}
      />
    </div>
  );
}
