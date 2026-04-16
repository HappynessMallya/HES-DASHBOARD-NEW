import { api } from "../api";
import type { ProfileOut, ProfileCreate } from "../types";

export const profilesService = {
  list: () => api<ProfileOut[]>("/api/profiles"),
  get: (id: number) => api<ProfileOut>(`/api/profiles/${id}`),
  create: (data: ProfileCreate) =>
    api<ProfileOut>("/api/profiles", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<ProfileCreate>) =>
    api<ProfileOut>(`/api/profiles/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    api<void>(`/api/profiles/${id}`, { method: "DELETE" }),
};
