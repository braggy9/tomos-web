import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { life } from "@tomos/api";
import type { CreateGoalRequest, UpdateGoalRequest } from "@tomos/api";

export function useGoals(params?: { status?: string; category?: string }) {
  return useQuery({
    queryKey: ["life", "goals", params],
    queryFn: () => life.getGoals(params),
    select: (res) => res.data,
  });
}

export function useGoal(id: string | null) {
  return useQuery({
    queryKey: ["life", "goals", id],
    queryFn: () => life.getGoal(id!),
    enabled: !!id,
    select: (res) => res.data,
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGoalRequest) => life.createGoal(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["life", "goals"] });
      qc.invalidateQueries({ queryKey: ["life", "today"] });
    },
  });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalRequest }) =>
      life.updateGoal(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["life", "goals"] });
      qc.invalidateQueries({ queryKey: ["life", "today"] });
    },
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => life.deleteGoal(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["life", "goals"] });
    },
  });
}
