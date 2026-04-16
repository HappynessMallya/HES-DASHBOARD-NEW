"use client";

import { useQuery } from "@tanstack/react-query";
import { obisService } from "../services/obis";
import { STALE_TIMES } from "../query-provider";

export function useOBISCodes(category?: string) {
  return useQuery({
    queryKey: ["obis", category],
    queryFn: () => obisService.list(category),
    staleTime: STALE_TIMES.static,
  });
}

export function useOBISCategories() {
  return useQuery({
    queryKey: ["obis", "categories"],
    queryFn: obisService.categories,
    staleTime: STALE_TIMES.static,
  });
}
