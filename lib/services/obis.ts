import { api } from "../api";
import type { OBISCode } from "../types";

export const obisService = {
  list: (category?: string) => {
    const qs = category ? `?category=${category}` : "";
    return api<OBISCode[]>(`/api/obis${qs}`);
  },

  categories: () => api<string[]>("/api/obis/categories"),
};
