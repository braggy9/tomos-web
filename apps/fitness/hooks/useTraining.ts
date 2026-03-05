"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { training } from "@tomos/api";

// ─── Today's Training Plan ──────────────────────

export function useTrainingToday() {
  return useQuery({
    queryKey: ["training", "today"],
    queryFn: () => training.getToday(),
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── Current Week ───────────────────────────────

export function useCurrentWeek() {
  return useQuery({
    queryKey: ["training", "week", "current"],
    queryFn: () => training.getCurrentWeek(),
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  });
}

// ─── All Blocks ─────────────────────────────────

export function useTrainingBlocks(status?: string) {
  return useQuery({
    queryKey: ["training", "blocks", status],
    queryFn: () => training.getBlocks(status),
    select: (res) => res.data,
  });
}

// ─── Single Block ───────────────────────────────

export function useTrainingBlock(id: string) {
  return useQuery({
    queryKey: ["training", "block", id],
    queryFn: () => training.getBlock(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}

// ─── Update Week Type ───────────────────────────

export function useUpdateWeek() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { weekType?: string; notes?: string; status?: string };
    }) => training.updateWeek(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training"] });
    },
  });
}

// ─── Update Planned Session ─────────────────────

export function useUpdatePlannedSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { status?: string; notes?: string };
    }) => training.updatePlannedSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training"] });
    },
  });
}
