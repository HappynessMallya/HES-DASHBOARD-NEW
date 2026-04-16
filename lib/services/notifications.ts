import { api } from "../api";
import type { AlertRule, AlertRuleCreate, NotificationLogEntry } from "../types";

export const notificationsService = {
  listRules: () => api<AlertRule[]>("/api/notifications/rules"),

  createRule: (data: AlertRuleCreate) =>
    api<AlertRule>("/api/notifications/rules", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateRule: (id: string, data: Partial<AlertRuleCreate>) =>
    api<AlertRule>(`/api/notifications/rules/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteRule: (id: string) =>
    api<void>(`/api/notifications/rules/${id}`, { method: "DELETE" }),

  log: (params?: { channel?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.channel) qs.set("channel", params.channel);
    if (params?.limit) qs.set("limit", String(params.limit));
    const q = qs.toString();
    return api<NotificationLogEntry[]>(`/api/notifications/log${q ? `?${q}` : ""}`);
  },
};
