"use client";

import { useQuery } from "@tanstack/react-query";
import { gisService } from "../services/gis";

export function useGISMeters(filters?: { region_id?: number; online_only?: boolean }) {
  return useQuery({
    queryKey: ["gis", "meters", filters],
    queryFn: () => gisService.meters(filters),
    staleTime: 60_000,
  });
}

export function useGISSubstations(filters?: { region_id?: number }) {
  return useQuery({
    queryKey: ["gis", "substations", filters],
    queryFn: () => gisService.substations(filters),
    staleTime: 60_000,
  });
}

export function useGISTransformers(filters?: { substation_id?: number }) {
  return useQuery({
    queryKey: ["gis", "transformers", filters],
    queryFn: () => gisService.transformers(filters),
    staleTime: 60_000,
  });
}

export function useGISDCUs(filters?: { transformer_id?: number }) {
  return useQuery({
    queryKey: ["gis", "dcus", filters],
    queryFn: () => gisService.dcus(filters),
    staleTime: 60_000,
  });
}

export function useGISDashboard() {
  return useQuery({
    queryKey: ["gis", "dashboard"],
    queryFn: gisService.dashboard,
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}
