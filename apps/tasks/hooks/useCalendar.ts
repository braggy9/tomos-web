"use client";

import { useQuery } from "@tanstack/react-query";
import { calendar } from "@tomos/api";

export function useM365Events() {
  return useQuery({
    queryKey: ["m365-events"],
    queryFn: () => calendar.getM365Events(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
