"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { DeviceGroup } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { GroupTable } from "@/components/groups/group-table";
import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { toast } from "sonner";

export default function GroupsPage() {
  const [groups, setGroups] = useState<DeviceGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    try {
      const data = await api<DeviceGroup[]>("/api/groups");
      setGroups(data);
    } catch {
      // empty state shown
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleDelete = async (id: string) => {
    try {
      await api(`/api/groups/${id}`, { method: "DELETE" });
      toast.success("Group deleted");
      fetchGroups();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete group"
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Device Groups"
        description="Organize meters into static or dynamic groups by region, transformer, or custom criteria"
        action={<CreateGroupDialog onCreated={fetchGroups} />}
      />
      <GroupTable groups={groups} loading={loading} onDelete={handleDelete} />
    </div>
  );
}
