"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth";
import { STALE_TIMES } from "../query-provider";
import type { UserCreate } from "../types";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: authService.listUsers,
    staleTime: STALE_TIMES.reference,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => authService.getUser(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UserCreate) => authService.createUser(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserCreate & { is_active: boolean }> }) =>
      authService.updateUser(id, data),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ["users", id] });
      qc.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => authService.deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: authService.listRoles,
    staleTime: STALE_TIMES.reference,
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; permissions: string[] }) =>
      authService.createRole(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; permissions?: string[] } }) =>
      authService.updateRole(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => authService.deleteRole(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["roles"] }),
  });
}

export function useModules() {
  return useQuery({
    queryKey: ["modules"],
    queryFn: authService.listModules,
    staleTime: STALE_TIMES.static,
  });
}

export function usePermissions(module?: string) {
  return useQuery({
    queryKey: ["permissions", module],
    queryFn: () => authService.listPermissions(module),
    staleTime: STALE_TIMES.static,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      authService.changePassword(data),
  });
}
