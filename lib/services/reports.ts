import { api } from "../api";
import type { ReportTypeInfo, ReportType, ReportFormat } from "../types";

export const reportsService = {
  types: () => api<ReportTypeInfo[]>("/api/reports/types"),

  generate: (
    type: ReportType,
    params: { format?: ReportFormat; from?: string; to?: string; limit?: number }
  ) => {
    const qs = new URLSearchParams();
    if (params.format) qs.set("format", params.format);
    if (params.from) qs.set("from", params.from);
    if (params.to) qs.set("to", params.to);
    if (params.limit) qs.set("limit", String(params.limit));
    const q = qs.toString();

    if (params.format === "csv" || params.format === "excel") {
      return reportsService.download(type, params);
    }
    return api<{ report_type: string; generated_at: string; count: number; data: unknown[] }>(
      `/api/reports/${type}${q ? `?${q}` : ""}`
    );
  },

  download: async (
    type: ReportType,
    params: { format?: ReportFormat; from?: string; to?: string; limit?: number }
  ) => {
    const qs = new URLSearchParams();
    if (params.format) qs.set("format", params.format);
    if (params.from) qs.set("from", params.from);
    if (params.to) qs.set("to", params.to);
    if (params.limit) qs.set("limit", String(params.limit));
    const q = qs.toString();

    const base =
      typeof window !== "undefined" && window.location.protocol === "https:"
        ? "/api/proxy"
        : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const res = await fetch(`${base}/api/reports/${type}${q ? `?${q}` : ""}`, {
      credentials: "same-origin",
    });
    if (!res.ok) throw new Error("Failed to download report");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}_report.${params.format === "excel" ? "xlsx" : "csv"}`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
