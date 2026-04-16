import { api } from "../api";
import type {
  UserOut,
  UserCreate,
  RoleOut,
  ChangePasswordRequest,
  Permission,
  ModuleOut,
} from "../types";

export const authService = {
  // Users
  listUsers: () => api<UserOut[]>("/api/auth/users"),
  getUser: (id: string) => api<UserOut>(`/api/auth/users/${id}`),
  createUser: (data: UserCreate) =>
    api<UserOut>("/api/auth/users", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateUser: (id: string, data: Partial<UserCreate & { is_active: boolean }>) =>
    api<UserOut>(`/api/auth/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteUser: (id: string) =>
    api<void>(`/api/auth/users/${id}`, { method: "DELETE" }),

  // Roles
  listRoles: () => api<RoleOut[]>("/api/auth/roles"),
  createRole: (data: { name: string; description?: string; permission_ids: number[] }) =>
    api<RoleOut>("/api/auth/roles", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateRole: (id: number, data: { name?: string; description?: string; permission_ids?: number[] }) =>
    api<RoleOut>(`/api/auth/roles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteRole: (id: number) =>
    api<void>(`/api/auth/roles/${id}`, { method: "DELETE" }),

  // Modules & Permissions
  listModules: () => api<ModuleOut[]>("/api/auth/modules"),
  listPermissions: (module?: string) => {
    const qs = module ? `?module=${module}` : "";
    return api<Permission[]>(`/api/auth/permissions${qs}`);
  },

  // Password
  changePassword: (data: ChangePasswordRequest) =>
    api<void>("/api/auth/me/password", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};
