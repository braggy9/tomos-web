"use client";

import { useQuery } from "@tanstack/react-query";
import { fitness } from "@tomos/api";

export function useWeeklyDashboard() {
  return useQuery({
    queryKey: ["fitness", "dashboard", "weekly"],
    queryFn: () => fitness.getWeeklyDashboard(),
    select: (res) => res.data,
    staleTime: 5 * 60 * 1000,
  });
}
