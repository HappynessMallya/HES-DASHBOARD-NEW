"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { firmwareService } from "../services/firmware";
import { STALE_TIMES } from "../query-provider";

export function useFirmwareImages() {
  return useQuery({
    queryKey: ["firmware", "images"],
    queryFn: firmwareService.listImages,
    staleTime: STALE_TIMES.reference,
  });
}

export function useUploadFirmware() {
  const [progress, setProgress] = useState(0);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (formData: FormData) =>
      firmwareService.uploadImage(formData, setProgress),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["firmware", "images"] });
      setProgress(0);
    },
  });

  return { ...mutation, progress };
}

export function useDeleteFirmwareImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => firmwareService.deleteImage(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["firmware", "images"] }),
  });
}

export function useFirmwareDeployments(params?: { status?: string; limit?: number }) {
  return useQuery({
    queryKey: ["firmware", "deployments", params],
    queryFn: () => firmwareService.listDeployments(params),
    staleTime: 10_000,
    refetchInterval: 30_000,
  });
}

export function useDeployFirmware() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { firmware_id: string; meter_ids: string[] }) =>
      firmwareService.deploy(data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["firmware", "deployments"] }),
  });
}

export function useDeployFirmwareBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { firmware_id: string; region_id: number }) =>
      firmwareService.deployBatch(data),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["firmware", "deployments"] }),
  });
}

export function useCancelDeployment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => firmwareService.cancelDeployment(id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["firmware", "deployments"] }),
  });
}
