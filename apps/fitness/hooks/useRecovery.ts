"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fitness } from "@tomos/api";
import type { CreateRecoveryCheckInRequest } from "@tomos/api";

export function useTodayRecovery() {
  return useQuery({
    queryKey: ["recovery-today"],
    queryFn: () => fitness.getTodayRecovery(),
    select: (res) => res.data,
  });
}

export function useRecoveryHistory(limit?: number) {
  return useQuery({
    queryKey: ["recovery-history", limit],
    queryFn: () => fitness.getRecoveryHistory(limit),
    select: (res) => res.data,
  });
}

export function useCreateCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecoveryCheckInRequest) => fitness.createRecoveryCheckIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recovery-today"] });
      queryClient.invalidateQueries({ queryKey: ["recovery-history"] });
      queryClient.invalidateQueries({ queryKey: ["daily-plan"] });
    },
  });
}
