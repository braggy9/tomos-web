"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fitness } from "@tomos/api";
import type {
  WeekType,
  QuickLogRequest,
  SessionSuggestion,
  GymSession,
  RunningStats,
  Exercise,
  Pagination,
} from "@tomos/api";

// ─── Suggestion ─────────────────────────────────

export function useSuggestion(weekType?: WeekType) {
  return useQuery({
    queryKey: ["fitness", "suggestion", weekType],
    queryFn: () => fitness.getSuggestion(weekType),
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Sessions ───────────────────────────────────

export function useSessions(params?: {
  type?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["fitness", "sessions", params],
    queryFn: () => fitness.getSessions(params),
    select: (res) => ({
      sessions: res.data,
      pagination: res.pagination,
    }),
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ["fitness", "session", id],
    queryFn: () => fitness.getSession(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}

// ─── Quick Log ──────────────────────────────────

export function useQuickLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: QuickLogRequest) => fitness.quickLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitness", "sessions"] });
      queryClient.invalidateQueries({ queryKey: ["fitness", "suggestion"] });
    },
  });
}

// ─── Exercises ──────────────────────────────────

export function useExercises(params?: {
  category?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ["fitness", "exercises", params],
    queryFn: () => fitness.getExercises(params),
    select: (res) => res.data,
  });
}

// ─── Running Stats ──────────────────────────────

export function useRunningStats() {
  return useQuery({
    queryKey: ["fitness", "running-stats"],
    queryFn: () => fitness.getRunningStats(),
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  });
}
