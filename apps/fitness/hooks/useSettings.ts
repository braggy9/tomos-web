"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fitness } from "@tomos/api";
import type { UserSettings } from "@tomos/api";

export function useSettings() {
  return useQuery({
    queryKey: ["fitness", "settings"],
    queryFn: () => fitness.getSettings(),
    select: (res) => res.data,
    staleTime: 10 * 60 * 1000,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Omit<UserSettings, "id">>) =>
      fitness.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitness", "settings"] });
      queryClient.invalidateQueries({
        queryKey: ["fitness", "running", "zones"],
      });
    },
  });
}
