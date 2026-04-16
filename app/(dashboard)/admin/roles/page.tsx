"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Can } from "@/components/shared/permission-gate";
import {
  useRoles,
  useCreateRole,
  useDeleteRole,
  usePermissions,
} from "@/lib/hooks/use-auth-admin";
import type { Permission } from "@/lib/types";
import { Shield, Plus, Trash2 } from "lucide-react";

export default function RolesPage() {
  const { data: roles, isLoading } = useRoles();
  const deleteRole = useDeleteRole();

  const handleDelete = async (id: number) => {
    try {
      await deleteRole.mutateAsync(id);
      toast.success("Role deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#14532d]">Role Management</h1>
        <Can permission="roles.create">
          <AddRoleDialog />
        </Can>
      </div>

      <Card className="border-[#bbf7d0]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#14532d]">
            <Shield className="h-5 w-5" />
            Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !roles?.length ? (
            <p className="py-8 text-center text-sm text-[#6b7280]">No roles found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => {
                  const perms = role.permissions ?? [];
                  return (
                    <TableRow key={role.id}>
                      <TableCell>{role.id}</TableCell>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell className="text-sm text-[#6b7280]">
                        {role.description ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {perms.slice(0, 5).map((p) => (
                            <Badge key={p.id} variant="outline" className="text-xs font-mono">
                              {p.code}
                            </Badge>
                          ))}
                          {perms.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{perms.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {!role.is_system && (
                          <Can permission="roles.delete">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDelete(role.id)}
                              disabled={deleteRole.isPending}
                              className="text-red-500 hover:text-red-700"
                              aria-label="Delete role"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </Can>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AddRoleDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedPermIds, setSelectedPermIds] = useState<Set<number>>(new Set());
  const { data: allPerms } = usePermissions();
  const create = useCreateRole();

  const togglePerm = (id: number) => {
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    try {
      await create.mutateAsync({ name, permission_ids: Array.from(selectedPermIds) });
      toast.success("Role created");
      setOpen(false);
      setName("");
      setSelectedPermIds(new Set());
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create role");
    }
  };

  // Group permissions by module
  const permsByModule: Record<string, Permission[]> = {};
  for (const p of allPerms ?? []) {
    const mod = p.code.split(".")[0];
    if (!permsByModule[mod]) permsByModule[mod] = [];
    permsByModule[mod].push(p);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-[#16a34a] hover:bg-[#15803d]" />}>
        <Plus className="mr-2 h-4 w-4" /> Add Role
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Role</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <Label>Role Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="operator" />
          </div>
          <div>
            <Label className="mb-2 block">
              Permissions ({selectedPermIds.size} selected)
            </Label>
            {Object.entries(permsByModule).map(([mod, perms]) => (
              <div key={mod} className="mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-1">
                  {mod}
                </p>
                <div className="space-y-1">
                  {perms.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 text-sm cursor-pointer hover:bg-[#f0fdf4] rounded px-2 py-1"
                    >
                      <Switch
                        checked={selectedPermIds.has(p.id)}
                        onCheckedChange={() => togglePerm(p.id)}
                      />
                      <span className="font-mono text-xs">{p.code}</span>
                      <span className="text-[#6b7280] text-xs">— {p.description}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {!allPerms?.length && (
              <p className="text-sm text-[#6b7280]">Loading permissions...</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={!name || create.isPending}
            className="bg-[#16a34a] hover:bg-[#15803d]"
          >
            {create.isPending ? "Creating..." : "Create Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
