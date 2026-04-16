import { api } from "../api";
import type {
  Region,
  Substation,
  Transformer,
  DCU,
  MeterAssignment,
  BatchAssignment,
} from "../types";

export const topologyService = {
  // Regions
  listRegions: () => api<Region[]>("/api/topology/regions"),
  createRegion: (data: { name: string; code: string }) =>
    api<Region>("/api/topology/regions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateRegion: (id: number, data: Partial<{ name: string; code: string }>) =>
    api<Region>(`/api/topology/regions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteRegion: (id: number) =>
    api<void>(`/api/topology/regions/${id}`, { method: "DELETE" }),

  // Substations
  listSubstations: (regionId?: number) => {
    const qs = regionId ? `?region_id=${regionId}` : "";
    return api<Substation[]>(`/api/topology/substations${qs}`);
  },
  createSubstation: (data: { name: string; region_id: number }) =>
    api<Substation>("/api/topology/substations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSubstation: (id: number, data: Partial<{ name: string; region_id: number }>) =>
    api<Substation>(`/api/topology/substations/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteSubstation: (id: number) =>
    api<void>(`/api/topology/substations/${id}`, { method: "DELETE" }),

  // Transformers
  listTransformers: (substationId?: number) => {
    const qs = substationId ? `?substation_id=${substationId}` : "";
    return api<Transformer[]>(`/api/topology/transformers${qs}`);
  },
  createTransformer: (data: { name: string; substation_id: number; rating_kva?: number }) =>
    api<Transformer>("/api/topology/transformers", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateTransformer: (id: number, data: Partial<{ name: string; substation_id: number; rating_kva: number }>) =>
    api<Transformer>(`/api/topology/transformers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteTransformer: (id: number) =>
    api<void>(`/api/topology/transformers/${id}`, { method: "DELETE" }),

  // DCUs
  listDCUs: (transformerId?: number) => {
    const qs = transformerId ? `?transformer_id=${transformerId}` : "";
    return api<DCU[]>(`/api/topology/dcus${qs}`);
  },
  createDCU: (data: { serial_number: string; transformer_id: number }) =>
    api<DCU>("/api/topology/dcus", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateDCU: (id: number, data: Partial<{ serial_number: string; transformer_id: number }>) =>
    api<DCU>(`/api/topology/dcus/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteDCU: (id: number) =>
    api<void>(`/api/topology/dcus/${id}`, { method: "DELETE" }),

  // Meter assignment
  assignMeter: (meterId: string, data: MeterAssignment) =>
    api<void>(`/api/topology/meters/${meterId}/assign`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  batchAssign: (data: BatchAssignment) =>
    api<void>("/api/topology/meters/batch-assign", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
