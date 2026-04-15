"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusDot } from "@/components/shared/status-dot";
import { Eye, X } from "lucide-react";
import { relativeTime } from "@/lib/utils";
import type { MeterOut } from "@/lib/types";

interface GroupMembersTableProps {
  meters: MeterOut[];
  loading: boolean;
  onRemove?: (meterId: string) => void;
}

export function GroupMembersTable({
  meters,
  loading,
  onRemove,
}: GroupMembersTableProps) {
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[#bbf7d0] overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#f0fdf4] hover:bg-[#f0fdf4]">
            <TableHead className="text-[#14532d]">Serial Number</TableHead>
            <TableHead className="text-[#14532d]">IP Address</TableHead>
            <TableHead className="text-[#14532d]">Status</TableHead>
            <TableHead className="text-[#14532d]">Last Seen</TableHead>
            <TableHead className="text-[#14532d]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meters.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-8 text-center text-[#6b7280]"
              >
                No meters in this group
              </TableCell>
            </TableRow>
          ) : (
            meters.map((meter) => (
              <TableRow key={meter.id} className="hover:bg-[#f0fdf4]/50">
                <TableCell className="font-mono text-sm">
                  {meter.serial_number}
                </TableCell>
                <TableCell className="text-sm">
                  {meter.ip_address}:{meter.port}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <StatusDot online={meter.is_online} />
                    <span className="text-sm">
                      {meter.is_online ? "Online" : "Offline"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-[#6b7280]">
                  {relativeTime(meter.last_seen)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Link href={`/meters/${meter.id}`}>
                      <Button variant="ghost" size="icon-xs" title="View meter">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    {onRemove && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        title="Remove from group"
                        onClick={() => onRemove(meter.id)}
                      >
                        <X className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
