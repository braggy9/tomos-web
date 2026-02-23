"use client";

import { useQuery } from "@tanstack/react-query";
import { tasks } from "@tomos/api";

export function useSmartSurface() {
  return useQuery({
    queryKey: ["smart-surface"],
    queryFn: () => tasks.getSmartSurface(),
    select: (data) => data.recommendations,
    staleTime: 60 * 1000,
  });
}
