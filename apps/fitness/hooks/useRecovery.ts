"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fitness } from "@tomos/api";
import type { CreateRecoveryRequest } from "@tomos/api";

export function useRecoveryCheckins(days?: number) {
  return useQuery({
    queryKey: ["fitness", "recovery", days],
    queryFn: () => fitness.getRecoveryCheckins(days),
    select: (res) => res.data,
  });
}

export function useSubmitRecovery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecoveryRequest) => fitness.submitRecovery(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fitness", "recovery"] });
    },
  });
}
