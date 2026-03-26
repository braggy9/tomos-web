import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { life } from "@tomos/api";
import type { CreateWeeklyPlanRequest, UpdateWeeklyPlanRequest } from "@tomos/api";

export function usePlans() {
  return useQuery({
    queryKey: ["life", "plans"],
    queryFn: () => life.getPlans(),
    select: (res) => res.data,
  });
}

export function useCurrentPlan() {
  return useQuery({
    queryKey: ["life", "plans", "current"],
    queryFn: () => life.getCurrentPlan(),
    staleTime: 5 * 60 * 1000,
    select: (res) => res.data,
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWeeklyPlanRequest) => life.createPlan(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["life", "plans"] });
      qc.invalidateQueries({ queryKey: ["life", "today"] });
    },
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWeeklyPlanRequest }) =>
      life.updatePlan(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["life", "plans"] });
      qc.invalidateQueries({ queryKey: ["life", "today"] });
    },
  });
}
