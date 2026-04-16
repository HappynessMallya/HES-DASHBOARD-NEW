import { api } from "../api";
import type { FirmwareVersion, FirmwareDeployment } from "../types";

export const firmwareService = {
  listImages: () => api<FirmwareVersion[]>("/api/firmware/images"),

  uploadImage: async (formData: FormData, onProgress?: (pct: number) => void) => {
    const base =
      typeof window !== "undefined" && window.location.protocol === "https:"
        ? "/api/proxy"
        : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const xhr = new XMLHttpRequest();
    return new Promise<FirmwareVersion>((resolve, reject) => {
      xhr.open("POST", `${base}/api/firmware/images`);
      xhr.setRequestHeader("Accept", "application/json");
      if (onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded * 100) / e.total));
        };
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(xhr.statusText));
        }
      };
      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.send(formData);
    });
  },

  deleteImage: (id: string) =>
    api<void>(`/api/firmware/images/${id}`, { method: "DELETE" }),

  deploy: (data: { firmware_id: string; meter_ids: string[] }) =>
    api<FirmwareDeployment>("/api/firmware/deploy", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  deployBatch: (data: { firmware_id: string; region_id: number }) =>
    api<FirmwareDeployment>("/api/firmware/deploy/batch", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listDeployments: (params?: { status?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.limit) qs.set("limit", String(params.limit));
    const q = qs.toString();
    return api<FirmwareDeployment[]>(`/api/firmware/deployments${q ? `?${q}` : ""}`);
  },

  cancelDeployment: (id: string) =>
    api<void>(`/api/firmware/deployments/${id}/cancel`, { method: "POST" }),
};
