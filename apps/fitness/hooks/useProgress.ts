"use client";

import { useQuery } from "@tanstack/react-query";
import { fitness } from "@tomos/api";
import type { FitnessProgressData } from "@tomos/api";

interface PersonalRecord {
  exerciseName: string;
  weight: number;
  date: string;
}

interface ProgressSummary {
  totalSessions: number;
  weeklyRate: number;
  currentStreak: number;
  personalRecords: PersonalRecord[];
}

export function useProgress(exerciseId: string | null, period?: number) {
  return useQuery({
    queryKey: ["progress", exerciseId, period],
    queryFn: () => fitness.getProgress(exerciseId!, period),
    select: (res) => res.data as FitnessProgressData,
    enabled: !!exerciseId,
  });
}

export function useProgressSummary() {
  return useQuery({
    queryKey: ["progress-summary"],
    queryFn: () => fitness.getProgressSummary(),
    select: (res) => res.data as ProgressSummary,
  });
}

export function useRunningStats() {
  return useQuery({
    queryKey: ["running-stats"],
    queryFn: () => fitness.getRunningStats(),
    select: (res) => res.data,
  });
}
