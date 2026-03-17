"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fitness } from "@tomos/api";
import type { FitnessQuickLogRequest, FitnessWeekType } from "@tomos/api";

export function useDailyPlan(weekType?: FitnessWeekType) {
  return useQuery({
    queryKey: ["daily-plan", weekType],
    queryFn: () => fitness.getDailyPlan(weekType),
    select: (res) => res.data,
  });
}

export function useSuggestion(weekType?: FitnessWeekType) {
  return useQuery({
    queryKey: ["suggestion", weekType],
    queryFn: () => fitness.getSuggestion(weekType),
    select: (res) => res.data,
  });
}

export function useSessions(limit?: number) {
  return useQuery({
    queryKey: ["sessions", limit],
    queryFn: () => fitness.getSessions(limit),
    select: (res) => res.data,
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ["session", id],
    queryFn: () => fitness.getSession(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useExercises() {
  return useQuery({
    queryKey: ["exercises"],
    queryFn: () => fitness.getExercises(),
    select: (res) => res.data,
  });
}

export function useQuickLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FitnessQuickLogRequest) => fitness.quickLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["daily-plan"] });
      queryClient.invalidateQueries({ queryKey: ["progress-summary"] });
    },
  });
}
