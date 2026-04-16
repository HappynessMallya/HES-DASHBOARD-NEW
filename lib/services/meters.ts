import { api } from "../api";
import type {
  MeterOut,
  MeterCreate,
  ReadRequest,
  LiveReadResponse,
  ReadingOut,
  ScheduleCreate,
  ScheduleOut,
  TopupRequest,
  TopupResponse,
  AutoTopupCreate,
  AutoTopupOut,
  EventOut,
  RelayRequest,
} from "../types";

export const metersService = {
  list: () => api<MeterOut[]>("/api/meters"),

  get: (id: string) => api<MeterOut>(`/api/meters/${id}`),

  create: (data: MeterCreate) =>
    api<MeterOut>("/api/meters", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<MeterCreate>) =>
    api<MeterOut>(`/api/meters/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    api<void>(`/api/meters/${id}`, { method: "DELETE" }),

  // Live cached reading
  read: (id: string, data: ReadRequest) =>
    api<LiveReadResponse>(`/api/meters/${id}/read`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Reading history
  readings: (id: string, params?: { from?: string; to?: string; limit?: number; last?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.last) qs.set("last", "true");
    const q = qs.toString();
    return api<ReadingOut[]>(`/api/meters/${id}/readings${q ? `?${q}` : ""}`);
  },

  // Events
  events: (id: string, params?: { type?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.type) qs.set("type", params.type);
    if (params?.limit) qs.set("limit", String(params.limit));
    const q = qs.toString();
    return api<EventOut[]>(`/api/meters/${id}/events${q ? `?${q}` : ""}`);
  },

  // Schedule
  getSchedule: (id: string) => api<ScheduleOut>(`/api/meters/${id}/schedule`),
  createSchedule: (id: string, data: ScheduleCreate) =>
    api<ScheduleOut>(`/api/meters/${id}/schedule`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteSchedule: (id: string) =>
    api<void>(`/api/meters/${id}/schedule`, { method: "DELETE" }),

  // Prepayment
  topup: (id: string, data: TopupRequest) =>
    api<TopupResponse>(`/api/meters/${id}/topup`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAutoTopup: (id: string) => api<AutoTopupOut>(`/api/meters/${id}/auto-topup`),
  setAutoTopup: (id: string, data: AutoTopupCreate) =>
    api<AutoTopupOut>(`/api/meters/${id}/auto-topup`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Control
  relay: (id: string, data: RelayRequest) =>
    api<{ status: string }>(`/api/meters/${id}/relay`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  clearTamper: (id: string) =>
    api<{ status: string }>(`/api/meters/${id}/clear-tamper`, { method: "POST" }),
  clearCredit: (id: string) =>
    api<{ status: string }>(`/api/meters/${id}/clear-credit`, { method: "POST" }),
  timesync: (id: string) =>
    api<{ status: string }>(`/api/meters/${id}/timesync`, { method: "POST" }),
};
