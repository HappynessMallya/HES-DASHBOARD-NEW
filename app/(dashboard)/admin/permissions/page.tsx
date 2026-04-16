"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { UserOut, RoleOut } from "@/lib/types";
import {
  Shield,
  Search,
  ChevronRight,
  User,
  Lock,
  Check,
  X,
} from "lucide-react";

// All permission codes from the API spec
const ALL_PERMISSIONS = [
  { code: "meters.read", module: "meters", description: "View meters, readings, dashboard" },
  { code: "meters.create", module: "meters", description: "Add/edit meters" },
  { code: "meters.delete", module: "meters", description: "Delete meters" },
  { code: "meters.schedule", module: "meters", description: "Configure reading schedules" },
  { code: "prepayment.topup", module: "prepayment", description: "Top-up meter balance" },
  { code: "prepayment.clear_credit", module: "prepayment", description: "Clear credit on meter" },
  { code: "control.relay", module: "control", description: "Connect/disconnect relay" },
  { code: "control.timesync", module: "control", description: "Sync meter time" },
  { code: "control.clear_tamper", module: "control", description: "Clear tamper events" },
  { code: "topology.read", module: "topology", description: "View topology tree" },
  { code: "topology.create", module: "topology", description: "Add regions/substations/transformers" },
  { code: "topology.update", module: "topology", description: "Edit topology & assign meters" },
  { code: "topology.delete", module: "topology", description: "Delete topology elements" },
  { code: "firmware.read", module: "firmware", description: "View firmware list" },
  { code: "firmware.upload", module: "firmware", description: "Upload firmware images" },
  { code: "firmware.deploy", module: "firmware", description: "Deploy firmware to devices" },
  { code: "notifications.read", module: "notifications", description: "View alert rules" },
  { code: "notifications.manage", module: "notifications", description: "Create/edit alert rules" },
  { code: "reports.read", module: "reports", description: "View and generate reports" },
  { code: "users.read", module: "users", description: "View user list" },
  { code: "users.create", module: "users", description: "Create users" },
  { code: "users.update", module: "users", description: "Edit users" },
  { code: "users.delete", module: "users", description: "Delete users" },
  { code: "roles.read", module: "roles", description: "View role list" },
  { code: "roles.create", module: "roles", description: "Create/edit roles" },
  { code: "roles.delete", module: "roles", description: "Delete roles" },
  { code: "cim.read", module: "cim", description: "CIM integration read" },
  { code: "cim.control", module: "cim", description: "CIM device control" },
  { code: "cim.manage", module: "cim", description: "Webhook management" },
  { code: "audit.read", module: "audit", description: "View audit logs" },
];

const MODULES = [...new Set(ALL_PERMISSIONS.map((p) => p.module))];

export default function PermissionsPage() {
  const { data: users, isLoading: loadingUsers } = useUsers();
  const { data: roles, isLoading: loadingRoles } = useRoles();
  const { data: backendPerms } = usePermissions();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserOut | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleOut | null>(null);
  const [view, setView] = useState<"users" | "roles">("users");

  // Use backend permissions if available, otherwise use our static list
  const permissionList = backendPerms?.length ? backendPerms : ALL_PERMISSIONS;

  const permsByModule = useMemo(() => {
    const map: Record<string, typeof permissionList> = {};
    for (const p of permissionList) {
      const mod = p.module || "other";
      if (!map[mod]) map[mod] = [];
      map[mod].push(p);
    }
    return map;
  }, [permissionList]);

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
        Every user must be assigned permissions to perform operations. Permissions are managed through roles — assign
        permissions to a role, then assign the role to users.
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
          <Input
            placeholder={view === "users" ? "Search users..." : "Search roles..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Users view */}
      {view === "users" && (
        <Card className="border-[#bbf7d0]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#14532d]">
              <User className="h-5 w-5" />
              User Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUsers ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
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
                            {u.role?.name ?? u.roles?.join(", ") ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {perms.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {perms.slice(0, 3).map((p) => (
                                <Badge key={p} variant="secondary" className="text-xs font-mono">
                                  {p}
                                </Badge>
                              ))}
                              {perms.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{perms.length - 3} more
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-red-500 flex items-center gap-1">
                              <X className="h-3 w-3" /> No permissions
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.is_active ? "default" : "destructive"}>
                            {u.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setSelectedUser(u)}
                            className="text-[#16a34a] hover:text-[#15803d]"
                            aria-label="View permissions"
                          >
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
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))
          ) : !filteredRoles.length ? (
            <p className="col-span-2 py-8 text-center text-sm text-[#6b7280]">No roles found</p>
          ) : (
            filteredRoles.map((role) => (
              <Card
                key={role.id}
                className="border-[#bbf7d0] cursor-pointer hover:border-[#16a34a] transition-colors"
                onClick={() => setSelectedRole(role)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-[#14532d]">
                      <Shield className="h-4 w-4 text-[#16a34a]" />
                      {role.name}
                    </span>
                    <Badge variant="secondary">
                      {role.permissions?.length ?? 0} permissions
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {role.permissions && role.permissions.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 8).map((p) => (
                        <Badge key={p} variant="outline" className="text-xs font-mono">
                          {p}
                        </Badge>
                      ))}
                      {role.permissions.length > 8 && (
                        <Badge variant="secondary" className="text-xs">
                          +{role.permissions.length - 8} more
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <X className="h-3 w-3" /> No permissions assigned
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Permission matrix for all available permissions */}
      <Card className="border-[#bbf7d0]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#14532d]">
            <Lock className="h-5 w-5" />
            All Available Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(permsByModule).map(([mod, perms]) => (
              <div key={mod}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6b7280] border-b border-[#bbf7d0] pb-1">
                  {mod}
                </h3>
                <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
                  {perms.map((p) => (
                    <div
                      key={p.code}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[#f0fdf4]"
                    >
                      <Lock className="h-3.5 w-3.5 text-[#16a34a] shrink-0" />
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-medium text-[#14532d]">{p.code}</span>
                        {p.description && (
                          <p className="text-xs text-[#6b7280] truncate">{p.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User permissions detail dialog */}
      {selectedUser && (
        <UserPermissionsDialog
          user={selectedUser}
          permsByModule={permsByModule}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {/* Role permissions editor dialog */}
      {selectedRole && (
        <RolePermissionsDialog
          role={selectedRole}
          permsByModule={permsByModule}
          onClose={() => setSelectedRole(null)}
        />
      )}
    </div>
  );
}

// --- User Permissions Dialog ---

function UserPermissionsDialog({
  user,
  permsByModule,
  onClose,
}: {
  user: UserOut;
  permsByModule: Record<string, { code: string; module: string; description?: string }[]>;
  onClose: () => void;
}) {
  const userPerms = new Set(user.permissions ?? []);
  const updateUser = useUpdateUser();
  const { data: roles } = useRoles();
  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    user.role?.id != null ? String(user.role.id) : ""
  );

  const handleChangeRole = async () => {
    if (!selectedRoleId) return;
    try {
      await updateUser.mutateAsync({
        id: user.id,
        data: { role_id: Number(selectedRoleId) },
      });
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
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#16a34a]" />
            {user.full_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <div className="rounded-lg bg-[#f0fdf4] p-3 text-sm space-y-1">
            <p><span className="font-medium text-[#14532d]">Username:</span> {user.username}</p>
            <p><span className="font-medium text-[#14532d]">Email:</span> {user.email}</p>
            <p>
              <span className="font-medium text-[#14532d]">Current Role:</span>{" "}
              <Badge variant="outline" className="bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]">
                {user.role?.name ?? "—"}
              </Badge>
            </p>
          </div>

          {/* Change role */}
          {roles && roles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#14532d]">Assign Role</p>
              <div className="flex gap-2">
                <Select value={selectedRoleId} onValueChange={(v) => setSelectedRoleId(v ?? "")}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.name} ({r.permissions?.length ?? 0} permissions)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleChangeRole}
                  disabled={!selectedRoleId || updateUser.isPending}
                  className="bg-[#16a34a] hover:bg-[#15803d]"
                >
                  {updateUser.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
              <p className="text-xs text-[#6b7280]">
                Changing the role will update the user&apos;s permissions to match the new role.
              </p>
            </div>
          )}

          {/* Current permissions grid */}
          <div>
            <p className="mb-2 text-sm font-medium text-[#14532d]">
              Current Permissions ({userPerms.size})
            </p>
            {Object.entries(permsByModule).map(([mod, perms]) => {
              const hasAny = perms.some((p) => userPerms.has(p.code));
              if (!hasAny && userPerms.size > 0) return null;
              return (
                <div key={mod} className="mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#6b7280] mb-1">
                    {mod}
                  </p>
                  <div className="space-y-0.5">
                    {perms.map((p) => {
                      const has = userPerms.has(p.code);
                      return (
                        <div
                          key={p.code}
                          className={`flex items-center gap-2 rounded px-2 py-1 text-sm ${
                            has ? "bg-[#dcfce7]" : "opacity-50"
                          }`}
                        >
                          {has ? (
                            <Check className="h-3.5 w-3.5 text-[#16a34a] shrink-0" />
                          ) : (
                            <X className="h-3.5 w-3.5 text-[#6b7280] shrink-0" />
                          )}
                          <span className="font-mono text-xs">{p.code}</span>
                          {p.description && (
                            <span className="text-xs text-[#6b7280]">— {p.description}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {userPerms.size === 0 && (
              <p className="text-sm text-red-500 py-4 text-center">
                This user has no permissions. Assign a role to grant permissions.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Role Permissions Editor Dialog ---

function RolePermissionsDialog({
  role,
  permsByModule,
  onClose,
}: {
  role: RoleOut;
  permsByModule: Record<string, { code: string; module: string; description?: string }[]>;
  onClose: () => void;
}) {
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(
    new Set(role.permissions ?? [])
  );
  const updateRole = useUpdateRole();

  const togglePerm = (code: string) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const toggleModule = (mod: string, perms: { code: string }[]) => {
    const allSelected = perms.every((p) => selectedPerms.has(p.code));
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      for (const p of perms) {
        if (allSelected) next.delete(p.code);
        else next.add(p.code);
      }
      return next;
    });
  };

  const handleSave = async () => {
    try {
      await updateRole.mutateAsync({
        id: role.id,
        data: { permissions: Array.from(selectedPerms) },
      });
      toast.success(`Permissions updated for role "${role.name}"`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update permissions");
    }
  };

  const hasChanges =
    selectedPerms.size !== (role.permissions?.length ?? 0) ||
    Array.from(selectedPerms).some((p) => !role.permissions?.includes(p));

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#16a34a]" />
            Edit Permissions: {role.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <p className="text-sm text-[#6b7280]">
            Toggle permissions for this role. All users with the &quot;{role.name}&quot; role
            will inherit these permissions.
          </p>

          <div className="rounded-lg bg-[#f0fdf4] p-2 text-sm text-center">
            <span className="font-medium text-[#14532d]">{selectedPerms.size}</span>
            <span className="text-[#6b7280]"> of {ALL_PERMISSIONS.length} permissions selected</span>
          </div>

          {Object.entries(permsByModule).map(([mod, perms]) => {
            const allSelected = perms.every((p) => selectedPerms.has(p.code));
            const someSelected = perms.some((p) => selectedPerms.has(p.code));
            return (
              <div key={mod} className="border border-[#bbf7d0] rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleModule(mod, perms)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-[#f0fdf4] hover:bg-[#dcfce7] transition-colors"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#14532d]">
                    {mod}
                  </span>
                  <Badge
                    variant={allSelected ? "default" : someSelected ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {perms.filter((p) => selectedPerms.has(p.code)).length}/{perms.length}
                  </Badge>
                </button>
                <div className="p-2 space-y-1">
                  {perms.map((p) => (
                    <label
                      key={p.code}
                      className="flex items-center gap-2 rounded px-2 py-1.5 text-sm cursor-pointer hover:bg-[#f0fdf4]"
                    >
                      <Switch
                        checked={selectedPerms.has(p.code)}
                        onCheckedChange={() => togglePerm(p.code)}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="font-mono text-xs font-medium">{p.code}</span>
                        {p.description && (
                          <p className="text-xs text-[#6b7280]">{p.description}</p>
                        )}
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
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateRole.isPending}
            className="bg-[#16a34a] hover:bg-[#15803d]"
          >
            {updateRole.isPending ? "Saving..." : "Save Permissions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
