import { api } from "../api";
import type { GeoJSONFeatureCollection, GISDashboard } from "../types";

export const gisService = {
  meters: (params?: { region_id?: number; online_only?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.region_id) qs.set("region_id", String(params.region_id));
    if (params?.online_only) qs.set("online_only", "true");
    const q = qs.toString();
    return api<GeoJSONFeatureCollection>(`/api/gis/meters${q ? `?${q}` : ""}`);
  },

  substations: (params?: { region_id?: number }) => {
    const qs = params?.region_id ? `?region_id=${params.region_id}` : "";
    return api<GeoJSONFeatureCollection>(`/api/gis/substations${qs}`);
  },

  transformers: (params?: { substation_id?: number }) => {
    const qs = params?.substation_id ? `?substation_id=${params.substation_id}` : "";
    return api<GeoJSONFeatureCollection>(`/api/gis/transformers${qs}`);
  },

  dcus: (params?: { transformer_id?: number }) => {
    const qs = params?.transformer_id ? `?transformer_id=${params.transformer_id}` : "";
    return api<GeoJSONFeatureCollection>(`/api/gis/dcus${qs}`);
  },

  dashboard: () => api<GISDashboard>("/api/gis/dashboard"),
};
