"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { journal } from "@tomos/api";

export function useInsights(days?: number) {
  return useQuery({
    queryKey: ["journal-insights", days],
    queryFn: () => journal.getInsights(days),
    select: (res) => res.data,
  });
}

export function useSummaries(type?: string) {
  return useQuery({
    queryKey: ["journal-summaries", type],
    queryFn: () => journal.getSummaries(type),
    select: (res) => res.data,
  });
}

export function useGenerateSummary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (type?: string) => journal.generateSummary(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-summaries"] });
      queryClient.invalidateQueries({ queryKey: ["journal-insights"] });
    },
  });
}
