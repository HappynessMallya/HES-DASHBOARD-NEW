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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Eye, Trash2 } from "lucide-react";
import { relativeTime } from "@/lib/utils";
import type { DeviceGroup } from "@/lib/types";

interface GroupTableProps {
  groups: DeviceGroup[];
  loading: boolean;
  onDelete?: (id: string) => void;
}

export function GroupTable({ groups, loading, onDelete }: GroupTableProps) {
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
            <TableHead className="text-[#14532d]">Name</TableHead>
            <TableHead className="text-[#14532d]">Type</TableHead>
            <TableHead className="text-[#14532d]">Description</TableHead>
            <TableHead className="text-[#14532d]">Members</TableHead>
            <TableHead className="text-[#14532d]">Created</TableHead>
            <TableHead className="text-[#14532d]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-8 text-center text-[#6b7280]"
              >
                No device groups created yet
              </TableCell>
            </TableRow>
          ) : (
            groups.map((group) => (
              <TableRow key={group.id} className="hover:bg-[#f0fdf4]/50">
                <TableCell className="font-medium text-[#14532d]">
                  {group.name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      group.type === "static"
                        ? "bg-sky-100 text-sky-700 border-sky-200"
                        : "bg-purple-100 text-purple-700 border-purple-200"
                    }
                  >
                    {group.type}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate text-sm text-[#6b7280]">
                  {group.description || "—"}
                </TableCell>
                <TableCell>{group.member_count}</TableCell>
                <TableCell className="text-sm text-[#6b7280]">
                  {relativeTime(group.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Link href={`/groups/${group.id}`}>
                      <Button variant="ghost" size="icon-xs" title="View">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    {onDelete && (
                      <ConfirmDialog
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        }
                        title="Delete Group"
                        description={`Are you sure you want to delete "${group.name}"? This will not delete the meters in the group.`}
                        confirmLabel="Delete"
                        variant="destructive"
                        onConfirm={() => onDelete(group.id)}
                      />
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
