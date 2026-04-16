"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profilesService } from "../services/profiles";
import { STALE_TIMES } from "../query-provider";
import type { ProfileCreate } from "../types";

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: profilesService.list,
    staleTime: STALE_TIMES.reference,
  });
}

export function useProfile(id: number) {
  return useQuery({
    queryKey: ["profiles", id],
    queryFn: () => profilesService.get(id),
    enabled: !!id,
    staleTime: STALE_TIMES.reference,
  });
}

export function useCreateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProfileCreate) => profilesService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profiles"] }),
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProfileCreate> }) =>
      profilesService.update(id, data),
    onSuccess: (_d, { id }) => {
      qc.invalidateQueries({ queryKey: ["profiles", id] });
      qc.invalidateQueries({ queryKey: ["profiles"] });
    },
  });
}

export function useDeleteProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => profilesService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profiles"] }),
  });
}
