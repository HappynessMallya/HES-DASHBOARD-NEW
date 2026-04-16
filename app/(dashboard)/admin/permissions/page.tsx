"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useUsers,
  useRoles,
  useUpdateRole,
  usePermissions,
  useModules,
  useUpdateUser,
} from "@/lib/hooks/use-auth-admin";
import type { UserOut, RoleOut, Permission } from "@/lib/types";
import {
  Shield,
  Search,
  ChevronRight,
  User,
  Lock,
  Check,
  X,
} from "lucide-react";

export default function PermissionsPage() {
  const { data: users, isLoading: loadingUsers } = useUsers();
  const { data: roles, isLoading: loadingRoles } = useRoles();
  const { data: allPerms } = usePermissions();
  const { data: modules } = useModules();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserOut | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleOut | null>(null);
  const [view, setView] = useState<"users" | "roles">("users");

  // Group permissions by module name
  const permsByModule = useMemo(() => {
    const map: Record<string, Permission[]> = {};
    for (const p of allPerms ?? []) {
      const mod = p.code.split(".")[0];
      if (!map[mod]) map[mod] = [];
      map[mod].push(p);
    }
    return map;
  }, [allPerms]);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  const filteredRoles = useMemo(() => {
    if (!roles) return [];
    if (!search) return roles;
    const q = search.toLowerCase();
    return roles.filter((r) => r.name.toLowerCase().includes(q));
  }, [roles, search]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#14532d]">Permissions Management</h1>
      </div>

      <p className="text-sm text-[#6b7280]">
        Permissions are managed through roles. Assign permissions to a role, then assign the role to users.
      </p>

      {/* View toggle + search */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex rounded-lg border border-[#bbf7d0] overflow-hidden">
          <button
            onClick={() => { setView("users"); setSearch(""); }}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              view === "users" ? "bg-[#16a34a] text-white" : "bg-white text-[#14532d] hover:bg-[#f0fdf4]"
            }`}
          >
            <User className="mr-1.5 inline h-4 w-4" />
            By User
          </button>
          <button
            onClick={() => { setView("roles"); setSearch(""); }}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              view === "roles" ? "bg-[#16a34a] text-white" : "bg-white text-[#14532d] hover:bg-[#f0fdf4]"
            }`}
          >
            <Shield className="mr-1.5 inline h-4 w-4" />
            By Role
          </button>
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
          <Input placeholder={view === "users" ? "Search users..." : "Search roles..."} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {/* Users view */}
      {view === "users" && (
        <Card className="border-[#bbf7d0]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#14532d]">
              <User className="h-5 w-5" /> User Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
            ) : !filteredUsers.length ? (
              <p className="py-8 text-center text-sm text-[#6b7280]">No users found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((u) => {
                    const perms = u.permissions ?? [];
                    return (
                      <TableRow key={u.id} className="hover:bg-[#f0fdf4]/50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-[#14532d]">{u.full_name}</p>
                            <p className="text-xs text-[#6b7280]">{u.username} &middot; {u.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]">
                            {u.role?.name ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {perms.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {perms.slice(0, 3).map((p) => (
                                <Badge key={p} variant="secondary" className="text-xs font-mono">{p}</Badge>
                              ))}
                              {perms.length > 3 && <Badge variant="secondary" className="text-xs">+{perms.length - 3} more</Badge>}
                            </div>
                          ) : (
                            <span className="text-xs text-red-500 flex items-center gap-1"><X className="h-3 w-3" /> No permissions</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.is_active ? "default" : "destructive"}>{u.is_active ? "Active" : "Inactive"}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon-sm" onClick={() => setSelectedUser(u)} className="text-[#16a34a] hover:text-[#15803d]" aria-label="View permissions">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Roles view */}
      {view === "roles" && (
        <div className="grid gap-4 md:grid-cols-2">
          {loadingRoles ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
          ) : !filteredRoles.length ? (
            <p className="col-span-2 py-8 text-center text-sm text-[#6b7280]">No roles found</p>
          ) : (
            filteredRoles.map((role) => {
              const perms = role.permissions ?? [];
              return (
                <Card key={role.id} className="border-[#bbf7d0] cursor-pointer hover:border-[#16a34a] transition-colors" onClick={() => setSelectedRole(role)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-[#14532d]">
                        <Shield className="h-4 w-4 text-[#16a34a]" />
                        {role.name}
                        {role.is_system && <Badge variant="secondary" className="text-xs">System</Badge>}
                      </span>
                      <Badge variant="secondary">{perms.length} permissions</Badge>
                    </CardTitle>
                    {role.description && <p className="text-xs text-[#6b7280]">{role.description}</p>}
                  </CardHeader>
                  <CardContent>
                    {perms.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {perms.slice(0, 8).map((p) => (
                          <Badge key={p.id} variant="outline" className="text-xs font-mono">{p.code}</Badge>
                        ))}
                        {perms.length > 8 && <Badge variant="secondary" className="text-xs">+{perms.length - 8} more</Badge>}
                      </div>
                    ) : (
                      <p className="text-xs text-red-500 flex items-center gap-1"><X className="h-3 w-3" /> No permissions assigned</p>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* All Available Permissions reference */}
      <Card className="border-[#bbf7d0]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#14532d]">
            <Lock className="h-5 w-5" /> All Available Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!allPerms?.length ? (
            <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(permsByModule).map(([mod, perms]) => {
                const moduleInfo = (modules ?? []).find((m) => m.name === mod);
                return (
                  <div key={mod}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6b7280] border-b border-[#bbf7d0] pb-1">
                      {mod} {moduleInfo?.description ? `— ${moduleInfo.description}` : ""}
                    </h3>
                    <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                      {perms.map((p) => (
                        <div key={p.id} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[#f0fdf4]">
                          <Lock className="h-3.5 w-3.5 text-[#16a34a] shrink-0" />
                          <div className="min-w-0">
                            <span className="font-mono text-xs font-medium text-[#14532d]">{p.code}</span>
                            <p className="text-xs text-[#6b7280] truncate">{p.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User detail dialog */}
      {selectedUser && (
        <UserPermissionsDialog user={selectedUser} roles={roles ?? []} permsByModule={permsByModule} onClose={() => setSelectedUser(null)} />
      )}

      {/* Role permissions editor dialog */}
      {selectedRole && (
        <RolePermissionsDialog role={selectedRole} allPerms={allPerms ?? []} permsByModule={permsByModule} onClose={() => setSelectedRole(null)} />
      )}
    </div>
  );
}

function UserPermissionsDialog({ user, roles, permsByModule, onClose }: {
  user: UserOut; roles: RoleOut[]; permsByModule: Record<string, Permission[]>; onClose: () => void;
}) {
  const userPerms = new Set(user.permissions ?? []);
  const updateUser = useUpdateUser();
  const [selectedRoleId, setSelectedRoleId] = useState<string>(user.role?.id != null ? String(user.role.id) : "");

  const handleChangeRole = async () => {
    if (!selectedRoleId) return;
    try {
      await updateUser.mutateAsync({ id: user.id, data: { role_id: Number(selectedRoleId) } });
      toast.success(`Role updated for ${user.full_name}`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><User className="h-5 w-5 text-[#16a34a]" /> {user.full_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="rounded-lg bg-[#f0fdf4] p-3 text-sm space-y-1">
            <p><span className="font-medium text-[#14532d]">Username:</span> {user.username}</p>
            <p><span className="font-medium text-[#14532d]">Email:</span> {user.email}</p>
            <p><span className="font-medium text-[#14532d]">Current Role:</span> <Badge variant="outline" className="bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]">{user.role?.name ?? "—"}</Badge></p>
          </div>
          {roles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#14532d]">Assign Role</p>
              <div className="flex gap-2">
                <Select value={selectedRoleId} onValueChange={(v) => setSelectedRoleId(v ?? "")}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>{r.name} ({r.permissions?.length ?? 0} permissions)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleChangeRole} disabled={!selectedRoleId || updateUser.isPending} className="bg-[#16a34a] hover:bg-[#15803d]">
                  {updateUser.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          )}
          <div>
            <p className="mb-2 text-sm font-medium text-[#14532d]">Current Permissions ({userPerms.size})</p>
            {Object.entries(permsByModule).map(([mod, perms]) => (
              <div key={mod} className="mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-1">{mod}</p>
                <div className="space-y-0.5">
                  {perms.map((p) => {
                    const has = userPerms.has(p.code);
                    return (
                      <div key={p.id} className={`flex items-center gap-2 rounded px-2 py-1 text-sm ${has ? "bg-[#dcfce7]" : "opacity-40"}`}>
                        {has ? <Check className="h-3.5 w-3.5 text-[#16a34a] shrink-0" /> : <X className="h-3.5 w-3.5 text-[#6b7280] shrink-0" />}
                        <span className="font-mono text-xs">{p.code}</span>
                        <span className="text-xs text-[#6b7280]">— {p.description}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {userPerms.size === 0 && <p className="text-sm text-red-500 py-4 text-center">No permissions. Assign a role to grant permissions.</p>}
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RolePermissionsDialog({ role, allPerms, permsByModule, onClose }: {
  role: RoleOut; allPerms: Permission[]; permsByModule: Record<string, Permission[]>; onClose: () => void;
}) {
  const currentPermIds = new Set((role.permissions ?? []).map((p) => p.id));
  const [selectedPermIds, setSelectedPermIds] = useState<Set<number>>(currentPermIds);
  const updateRole = useUpdateRole();

  const togglePerm = (id: number) => {
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleModule = (perms: Permission[]) => {
    const allSelected = perms.every((p) => selectedPermIds.has(p.id));
    setSelectedPermIds((prev) => {
      const next = new Set(prev);
      for (const p of perms) { if (allSelected) next.delete(p.id); else next.add(p.id); }
      return next;
    });
  };

  const handleSave = async () => {
    try {
      await updateRole.mutateAsync({ id: role.id, data: { permission_ids: Array.from(selectedPermIds) } });
      toast.success(`Permissions updated for "${role.name}"`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const hasChanges = selectedPermIds.size !== currentPermIds.size || [...selectedPermIds].some((id) => !currentPermIds.has(id));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-[#16a34a]" /> Edit: {role.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {role.description && <p className="text-sm text-[#6b7280]">{role.description}</p>}
          <div className="rounded-lg bg-[#f0fdf4] p-2 text-sm text-center">
            <span className="font-medium text-[#14532d]">{selectedPermIds.size}</span>
            <span className="text-[#6b7280]"> of {allPerms.length} permissions selected</span>
          </div>
          {Object.entries(permsByModule).map(([mod, perms]) => {
            const allSelected = perms.every((p) => selectedPermIds.has(p.id));
            const someSelected = perms.some((p) => selectedPermIds.has(p.id));
            return (
              <div key={mod} className="border border-[#bbf7d0] rounded-lg overflow-hidden">
                <button onClick={() => toggleModule(perms)} className="w-full flex items-center justify-between px-3 py-2 bg-[#f0fdf4] hover:bg-[#dcfce7] transition-colors">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#14532d]">{mod}</span>
                  <Badge variant={allSelected ? "default" : someSelected ? "secondary" : "outline"} className="text-xs">
                    {perms.filter((p) => selectedPermIds.has(p.id)).length}/{perms.length}
                  </Badge>
                </button>
                <div className="p-2 space-y-1">
                  {perms.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm cursor-pointer hover:bg-[#f0fdf4]">
                      <Switch checked={selectedPermIds.has(p.id)} onCheckedChange={() => togglePerm(p.id)} />
                      <div className="min-w-0 flex-1">
                        <span className="font-mono text-xs font-medium">{p.code}</span>
                        <p className="text-xs text-[#6b7280]">{p.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleSave} disabled={!hasChanges || updateRole.isPending} className="bg-[#16a34a] hover:bg-[#15803d]">
            {updateRole.isPending ? "Saving..." : "Save Permissions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
