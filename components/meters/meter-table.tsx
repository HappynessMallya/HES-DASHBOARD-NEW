"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/shared/status-dot";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { relativeTime, fullDateTime } from "@/lib/utils";
import { Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import type { MeterOut } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MeterTableProps {
  meters: MeterOut[];
  loading: boolean;
  showDelete?: boolean;
  showCreatedAt?: boolean;
  onDelete?: (id: string) => void;
}

export function MeterTable({
  meters,
  loading,
  showDelete = false,
  showCreatedAt = false,
  onDelete,
}: MeterTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (meters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] py-12">
        <p className="text-lg font-medium text-[#14532d]">No meters registered</p>
        <p className="mt-1 text-sm text-[#6b7280]">Register a meter to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#bbf7d0]">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#f0fdf4] hover:bg-[#f0fdf4]">
            <TableHead className="text-[#166534]">Serial Number</TableHead>
            <TableHead className="text-[#166534]">IP Address</TableHead>
            <TableHead className="text-[#166534]">Port</TableHead>
            <TableHead className="text-[#166534]">Status</TableHead>
            <TableHead className="text-[#166534]">Security</TableHead>
            <TableHead className="text-[#166534]">Last Seen</TableHead>
            {showCreatedAt && <TableHead className="text-[#166534]">Created At</TableHead>}
            <TableHead className="text-right text-[#166534]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {meters.map((meter) => (
            <TableRow key={meter.id} className="hover:bg-[#f0fdf4]/50">
              <TableCell className="font-medium text-[#14532d]">
                {meter.serial_number}
              </TableCell>
              <TableCell className="font-mono text-sm">{meter.ip_address || "—"}</TableCell>
              <TableCell className="font-mono text-sm">{meter.port}</TableCell>
              <TableCell>
                <span className="flex items-center gap-2">
                  <StatusDot online={meter.is_online} />
                  <span className={meter.is_online ? "text-[#16a34a]" : "text-[#dc2626]"}>
                    {meter.is_online ? "Online" : "Offline"}
                  </span>
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex rounded-full bg-[#dcfce7] px-2.5 py-0.5 text-xs font-medium text-[#15803d]">
                  {meter.security_level}
                </span>
              </TableCell>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger className="text-[#6b7280] cursor-default">
                    {relativeTime(meter.last_seen)}
                  </TooltipTrigger>
                  <TooltipContent>{fullDateTime(meter.last_seen)}</TooltipContent>
                </Tooltip>
              </TableCell>
              {showCreatedAt && (
                <TableCell className="text-[#6b7280]">
                  {fullDateTime(meter.created_at)}
                </TableCell>
              )}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Link href={`/meters/${meter.id}`}>
                    <Button variant="ghost" size="sm" aria-label={`View meter ${meter.serial_number}`}>
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                  </Link>
                  {showDelete && onDelete && (
                    <ConfirmDialog
                      trigger={
                        <Button variant="ghost" size="sm" className="text-[#dc2626] hover:text-red-700" aria-label={`Delete meter ${meter.serial_number}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                      title="Delete Meter"
                      description={`Are you sure you want to delete meter ${meter.serial_number}? This action cannot be undone.`}
                      confirmLabel="Delete"
                      variant="destructive"
                      onConfirm={() => onDelete(meter.id)}
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
