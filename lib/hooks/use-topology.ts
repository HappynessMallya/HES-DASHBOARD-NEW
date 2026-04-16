"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { topologyService } from "../services/topology";
import { STALE_TIMES } from "../query-provider";
import type { MeterAssignment, BatchAssignment } from "../types";

// Regions
export function useRegions() {
  return useQuery({
    queryKey: ["topology", "regions"],
    queryFn: topologyService.listRegions,
    staleTime: STALE_TIMES.reference,
  });
}

export function useCreateRegion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; code: string }) =>
      topologyService.createRegion(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topology", "regions"] }),
  });
}

export function useUpdateRegion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ name: string; code: string }> }) =>
      topologyService.updateRegion(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topology", "regions"] }),
  });
}

export function useDeleteRegion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => topologyService.deleteRegion(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topology", "regions"] }),
  });
}

// Substations
export function useSubstations(regionId?: number) {
  return useQuery({
    queryKey: ["topology", "substations", { region_id: regionId }],
    queryFn: () => topologyService.listSubstations(regionId),
    staleTime: STALE_TIMES.reference,
  });
}

export function useCreateSubstation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; region_id: number }) =>
      topologyService.createSubstation(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topology", "substations"] }),
  });
}

export function useUpdateSubstation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ name: string; region_id: number }> }) =>
      topologyService.updateSubstation(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topology", "substations"] }),
  });
}

export function useDeleteSubstation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => topologyService.deleteSubstation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topology", "substations"] }),
  });
}

// Transformers
export function useTransformers(substationId?: number) {
  return useQuery({
    queryKey: ["topology", "transformers", { substation_id: substationId }],
    queryFn: () => topologyService.listTransformers(substationId),
    staleTime: STALE_TIMES.reference,
  });
}

export function useCreateTransformer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; substation_id: number; rating_kva?: number }) =>
      topologyService.createTransformer(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topology", "transformers"] }),
  });
}

export function useUpdateTransformer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ name: string; substation_id: number; rating_kva: number }> }) =>
      topologyService.updateTransformer(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topology", "transformers"] }),
  });
}

export function useDeleteTransformer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => topologyService.deleteTransformer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topology", "transformers"] }),
  });
}

// DCUs
export function useDCUs(transformerId?: number) {
  return useQuery({
    queryKey: ["topology", "dcus", { transformer_id: transformerId }],
    queryFn: () => topologyService.listDCUs(transformerId),
    staleTime: STALE_TIMES.reference,
  });
}

export function useCreateDCU() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { serial_number: string; transformer_id: number }) =>
      topologyService.createDCU(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topology", "dcus"] }),
  });
}

export function useUpdateDCU() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<{ serial_number: string; transformer_id: number }> }) =>
      topologyService.updateDCU(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topology", "dcus"] }),
  });
}

export function useDeleteDCU() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => topologyService.deleteDCU(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topology", "dcus"] }),
  });
}

// Meter Assignment
export function useAssignMeter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ meterId, data }: { meterId: string; data: MeterAssignment }) =>
      topologyService.assignMeter(meterId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meters"] });
      qc.invalidateQueries({ queryKey: ["gis"] });
    },
  });
}

export function useBatchAssign() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: BatchAssignment) => topologyService.batchAssign(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meters"] });
      qc.invalidateQueries({ queryKey: ["gis"] });
    },
  });
}
