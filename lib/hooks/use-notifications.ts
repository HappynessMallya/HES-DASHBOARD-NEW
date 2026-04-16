"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsService } from "../services/notifications";
import type { AlertRuleCreate } from "../types";

export function useNotificationRules() {
  return useQuery({
    queryKey: ["notifications", "rules"],
    queryFn: notificationsService.listRules,
    staleTime: 30_000,
  });
}

export function useCreateNotificationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AlertRuleCreate) => notificationsService.createRule(data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["notifications", "rules"] }),
  });
}

export function useUpdateNotificationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AlertRuleCreate> }) =>
      notificationsService.updateRule(id, data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["notifications", "rules"] }),
  });
}

export function useDeleteNotificationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsService.deleteRule(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["notifications", "rules"] }),
  });
}

export function useNotificationLog(params?: { channel?: string; limit?: number }) {
  return useQuery({
    queryKey: ["notifications", "log", params],
    queryFn: () => notificationsService.log(params),
    staleTime: 0,
  });
}
