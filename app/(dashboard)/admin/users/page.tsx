"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { UserOut, UserCreate, Role } from "@/lib/types";
import { PageHeader } from "@/components/shared/page-header";
import { RoleBadge } from "@/components/shared/role-badge";
import { RoleGate } from "@/components/shared/role-gate";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2, Pencil, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { relativeTime } from "@/lib/utils";

const ALL_ROLES: { key: Role; label: string }[] = [
  { key: "data_access", label: "Data Access" },
  { key: "operations", label: "Operations" },
  { key: "device_management", label: "Device Management" },
  { key: "user_admin", label: "User Admin" },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<UserCreate>({
    username: "",
    email: "",
    full_name: "",
    password: "",
    roles: ["data_access"],
  });

  const fetchUsers = useCallback(async () => {
    try {
      const data = await api<UserOut[]>("/api/admin/users");
      setUsers(data);
    } catch {
      // empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleRole = (role: Role) => {
    setForm((f) => ({
      ...f,
      roles: (f.roles ?? []).includes(role)
        ? (f.roles ?? []).filter((r) => r !== role)
        : [...(f.roles ?? []), role],
    }));
  };

  const handleCreate = async () => {
    if (!form.username || !form.email || !form.password) return;
    setCreating(true);

    try {
      await api("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("User created successfully");
      setCreateOpen(false);
      setForm({
        username: "",
        email: "",
        full_name: "",
        password: "",
        roles: ["data_access"],
      });
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (userId: string, active: boolean) => {
    try {
      await api(`/api/admin/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: active }),
      });
      toast.success(active ? "User activated" : "User deactivated");
      fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update user");
    }
  };

  return (
    <RoleGate
      role="user_admin"
      fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <ShieldOff className="mb-4 h-12 w-12 text-[#bbf7d0]" />
          <p className="text-lg font-medium text-[#14532d]">Access Denied</p>
          <p className="text-sm text-[#6b7280]">
            You need User Admin role to access this page
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        <PageHeader
          title="User Management"
          description="Manage user accounts and role-based access control"
          action={
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger
                render={
                  <Button className="bg-[#16a34a] hover:bg-[#15803d]">
                    <Plus className="mr-2 h-4 w-4" />
                    New User
                  </Button>
                }
              />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create User Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input
                        value={form.username}
                        onChange={(e) =>
                          setForm({ ...form, username: e.target.value })
                        }
                        required
                        className="border-[#bbf7d0]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={form.full_name}
                        onChange={(e) =>
                          setForm({ ...form, full_name: e.target.value })
                        }
                        className="border-[#bbf7d0]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      required
                      className="border-[#bbf7d0]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      required
                      className="border-[#bbf7d0]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Roles</Label>
                    <div className="space-y-2 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-3">
                      {ALL_ROLES.map((r) => (
                        <div
                          key={r.key}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-[#14532d]">
                            {r.label}
                          </span>
                          <Switch
                            checked={(form.roles ?? []).includes(r.key)}
                            onCheckedChange={() => toggleRole(r.key)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleCreate}
                    disabled={
                      creating ||
                      !form.username ||
                      !form.email ||
                      !form.password
                    }
                    className="w-full bg-[#16a34a] hover:bg-[#15803d]"
                  >
                    {creating && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create User
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          }
        />

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-[#bbf7d0] overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#f0fdf4] hover:bg-[#f0fdf4]">
                  <TableHead className="text-[#14532d]">Username</TableHead>
                  <TableHead className="text-[#14532d]">Name</TableHead>
                  <TableHead className="text-[#14532d]">Email</TableHead>
                  <TableHead className="text-[#14532d]">Roles</TableHead>
                  <TableHead className="text-[#14532d]">Status</TableHead>
                  <TableHead className="text-[#14532d]">Last Login</TableHead>
                  <TableHead className="text-[#14532d]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-[#6b7280]"
                    >
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-[#f0fdf4]/50">
                      <TableCell className="font-medium text-[#14532d]">
                        {user.username}
                      </TableCell>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell className="text-sm text-[#6b7280]">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <RoleBadge key={role} role={role} />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            user.is_active
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-red-100 text-red-700 border-red-200"
                          }
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-[#6b7280]">
                        {relativeTime(user.last_login)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() =>
                              toggleActive(user.id, !user.is_active)
                            }
                            title={
                              user.is_active ? "Deactivate" : "Activate"
                            }
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </RoleGate>
  );
}
