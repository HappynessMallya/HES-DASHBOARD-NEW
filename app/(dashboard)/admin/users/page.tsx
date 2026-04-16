"use client";

import { useState } from "react";
import { Can } from "@/components/shared/permission-gate";
import { PageHeader } from "@/components/shared/page-header";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useRoles,
} from "@/lib/hooks/use-auth-admin";
import { Plus, Loader2, Pencil, Trash2, ShieldOff, Search } from "lucide-react";
import { toast } from "sonner";
import { relativeTime } from "@/lib/utils";
import type { UserOut } from "@/lib/types";

export default function UserManagementPage() {
  const { data: users, isLoading } = useUsers();
  const { data: roles } = useRoles();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserOut | null>(null);

  // Create form
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");

  // Edit form
  const [editRoleId, setEditRoleId] = useState("");

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setFullName("");
    setPassword("");
    setRoleId("");
  };

  const handleCreate = async () => {
    if (!username || !email || !password || !roleId) return;
    try {
      await createUser.mutateAsync({
        username,
        email,
        full_name: fullName,
        password,
        role_id: Number(roleId),
      });
      toast.success("User created successfully");
      setCreateOpen(false);
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create user");
    }
  };

  const handleUpdate = async () => {
    if (!editUser || !editRoleId) return;
    try {
      await updateUser.mutateAsync({
        id: editUser.id,
        data: { role_id: Number(editRoleId) },
      });
      toast.success("User updated");
      setEditUser(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleToggleActive = async (user: UserOut) => {
    try {
      await updateUser.mutateAsync({
        id: user.id,
        data: { is_active: !user.is_active },
      });
      toast.success(user.is_active ? "User deactivated" : "User activated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteUser.mutateAsync(id);
      toast.success("User deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  };

  const userList = users ?? [];
  const filtered = userList.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage user accounts, assign roles and permissions"
        action={
          <Can permission="users.create">
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger
                render={
                  <Button className="bg-[#16a34a] hover:bg-[#15803d]" />
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                New User
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create User Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Username *</Label>
                      <Input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="operator1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@tanesco.co.tz"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password *</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role *</Label>
                    <Select value={roleId} onValueChange={(v) => setRoleId(v ?? "")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {(roles ?? []).map((r) => (
                          <SelectItem key={r.id} value={String(r.id)}>
                            {r.name} ({r.permissions?.length ?? 0} permissions)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-[#6b7280]">
                      The role determines which permissions the user has.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                  <Button
                    onClick={handleCreate}
                    disabled={createUser.isPending || !username || !email || !password || !roleId}
                    className="bg-[#16a34a] hover:bg-[#15803d]"
                  >
                    {createUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create User
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Can>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7280]" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Users table */}
      {isLoading ? (
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
                <TableHead className="text-[#14532d]">Role</TableHead>
                <TableHead className="text-[#14532d]">Permissions</TableHead>
                <TableHead className="text-[#14532d]">Status</TableHead>
                <TableHead className="text-[#14532d]">Created</TableHead>
                <TableHead className="text-[#14532d]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-[#6b7280]">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow key={user.id} className="hover:bg-[#f0fdf4]/50">
                    <TableCell className="font-medium text-[#14532d]">
                      {user.username}
                    </TableCell>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell className="text-sm text-[#6b7280]">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]">
                        {user.role?.name ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-[#6b7280]">
                        {user.permissions?.length ?? 0} permissions
                      </span>
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
                      {relativeTime(user.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Can permission="users.update">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => {
                              setEditUser(user);
                              setEditRoleId(user.role?.id != null ? String(user.role.id) : "");
                            }}
                            title="Edit role"
                            className="text-[#16a34a] hover:text-[#15803d]"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Can>
                        <Can permission="users.update">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleToggleActive(user)}
                            title={user.is_active ? "Deactivate" : "Activate"}
                            className={user.is_active ? "text-amber-500 hover:text-amber-700" : "text-green-500 hover:text-green-700"}
                          >
                            <ShieldOff className="h-3.5 w-3.5" />
                          </Button>
                        </Can>
                        <Can permission="users.delete">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDelete(user.id)}
                            title="Delete user"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </Can>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit user dialog */}
      {editUser && (
        <Dialog open onOpenChange={(o) => !o && setEditUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User: {editUser.full_name || editUser.username}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg bg-[#f0fdf4] p-3 text-sm space-y-1">
                <p><span className="font-medium">Username:</span> {editUser.username}</p>
                <p><span className="font-medium">Email:</span> {editUser.email}</p>
                <p>
                  <span className="font-medium">Current Role:</span>{" "}
                  <Badge variant="outline" className="bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]">
                    {editUser.role?.name ?? "—"}
                  </Badge>
                </p>
                <p>
                  <span className="font-medium">Permissions:</span>{" "}
                  {editUser.permissions?.length ?? 0} assigned
                </p>
              </div>

              <div className="space-y-2">
                <Label>Assign Role</Label>
                <Select value={editRoleId} onValueChange={(v) => setEditRoleId(v ?? "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {(roles ?? []).map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.name} ({r.permissions?.length ?? 0} permissions)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#6b7280]">
                  Changing the role updates the user&apos;s permissions to match the role.
                </p>
              </div>

              {/* Show permissions for selected role */}
              {editRoleId && roles && (
                <div className="space-y-1">
                  <Label className="text-xs">Permissions for selected role:</Label>
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                    {roles
                      .find((r) => String(r.id) === editRoleId)
                      ?.permissions?.map((p) => (
                        <Badge key={p.id} variant="secondary" className="text-xs font-mono">
                          {p.code}
                        </Badge>
                      )) ?? (
                      <span className="text-xs text-[#6b7280]">No permissions</span>
                    )}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
              <Button
                onClick={handleUpdate}
                disabled={!editRoleId || updateUser.isPending}
                className="bg-[#16a34a] hover:bg-[#15803d]"
              >
                {updateUser.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
