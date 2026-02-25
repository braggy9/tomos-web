"use client";

import { useQuery } from "@tanstack/react-query";
import { fitness } from "@tomos/api";

export function useProgress(exerciseId: string | null, period?: number) {
  return useQuery({
    queryKey: ["progress", exerciseId, period],
    queryFn: () => fitness.getProgress(exerciseId!, period),
    select: (res) => res.data,
    enabled: !!exerciseId,
  });
}

export function useProgressSummary() {
  return useQuery({
    queryKey: ["progress-summary"],
    queryFn: () => fitness.getProgressSummary(),
    select: (res) => res.data,
  });
}

export function useRunningStats() {
  return useQuery({
    queryKey: ["running-stats"],
    queryFn: () => fitness.getRunningStats(),
    select: (res) => res.data,
  });
}
