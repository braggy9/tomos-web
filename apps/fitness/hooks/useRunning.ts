"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fitness } from "@tomos/api";
import type { CreateRunSessionRequest } from "@tomos/api";

export function useTodayRun() {
  return useQuery({
    queryKey: ["fitness", "running", "today"],
    queryFn: () => fitness.getTodayRun(),
    select: (res) => res.data,
    staleTime: 2 * 60 * 1000,
  });
}

export function useRunningActivities(params?: {
  days?: number;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["fitness", "running", "activities", params],
    queryFn: () => fitness.getRunningActivities(params),
    select: (res) => ({
      activities: res.data,
      pagination: res.pagination,
    }),
  });
}

export function useRunningActivity(id: string) {
  return useQuery({
    queryKey: ["fitness", "running", "activity", id],
    queryFn: () => fitness.getRunningActivity(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useActivityStreams(id: string, enabled = false) {
  return useQuery({
    queryKey: ["fitness", "running", "streams", id],
    queryFn: () => fitness.getActivityStreams(id),
    select: (res) => res.data,
    enabled: enabled && !!id,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useCreateRunSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRunSessionRequest) =>
      fitness.createRunSession(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["fitness", "running", "today"],
      });
      queryClient.invalidateQueries({
        queryKey: ["fitness", "running", "activities"],
      });
    },
  });
}

export function useHRZones(activityId?: string) {
  return useQuery({
    queryKey: ["fitness", "running", "zones", activityId],
    queryFn: () => fitness.getHRZones(activityId),
    select: (res) => res.data,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCoachToday() {
  return useQuery({
    queryKey: ["fitness", "coach", "today"],
    queryFn: () => fitness.getCoachToday(),
    select: (res) => res.data,
    staleTime: 2 * 60 * 1000,
  });
}

export function useManualSync() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => fitness.triggerManualSync(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["fitness", "running"],
      });
    },
  });
}
