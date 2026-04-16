"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { metersService } from "../services/meters";
import type { MeterCreate, ReadRequest } from "../types";

export function useMeters() {
  return useQuery({
    queryKey: ["meters"],
    queryFn: metersService.list,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useMeter(id: string) {
  return useQuery({
    queryKey: ["meters", id],
    queryFn: () => metersService.get(id),
    enabled: !!id,
  });
}

export function useCreateMeter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MeterCreate) => metersService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meters"] }),
  });
}

export function useUpdateMeter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MeterCreate> }) =>
      metersService.update(id, data),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ["meters", id] });
      qc.invalidateQueries({ queryKey: ["meters"] });
    },
  });
}

export function useDeleteMeter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => metersService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meters"] }),
  });
}

export function useLiveRead(meterId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReadRequest) => metersService.read(meterId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["readings", meterId] });
    },
  });
}

export function useReadings(
  meterId: string,
  params?: { from?: string; to?: string; limit?: number }
) {
  return useQuery({
    queryKey: ["readings", meterId, params],
    queryFn: () => metersService.readings(meterId, params),
    enabled: !!meterId,
    staleTime: 10_000,
  });
}

export function useMeterEvents(
  meterId: string,
  params?: { type?: string; limit?: number }
) {
  return useQuery({
    queryKey: ["events", meterId, params],
    queryFn: () => metersService.events(meterId, params),
    enabled: !!meterId,
    staleTime: 10_000,
  });
}

export function useMeterSchedule(meterId: string) {
  return useQuery({
    queryKey: ["schedule", meterId],
    queryFn: () => metersService.getSchedule(meterId),
    enabled: !!meterId,
  });
}

export function useCreateSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ meterId, data }: { meterId: string; data: { interval_minutes?: number; objects?: string[] } }) =>
      metersService.createSchedule(meterId, data),
    onSuccess: (_d, { meterId }) =>
      qc.invalidateQueries({ queryKey: ["schedule", meterId] }),
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (meterId: string) => metersService.deleteSchedule(meterId),
    onSuccess: (_d, meterId) =>
      qc.invalidateQueries({ queryKey: ["schedule", meterId] }),
  });
}

export function useTopup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ meterId, token }: { meterId: string; token: string }) =>
      metersService.topup(meterId, { token }),
    onSuccess: (_d, { meterId }) =>
      qc.invalidateQueries({ queryKey: ["readings", meterId] }),
  });
}

export function useRelayControl() {
  return useMutation({
    mutationFn: ({ meterId, action }: { meterId: string; action: "connect" | "disconnect" }) =>
      metersService.relay(meterId, { action }),
  });
}

export function useClearTamper() {
  return useMutation({
    mutationFn: (meterId: string) => metersService.clearTamper(meterId),
  });
}

export function useTimesync() {
  return useMutation({
    mutationFn: (meterId: string) => metersService.timesync(meterId),
  });
}
