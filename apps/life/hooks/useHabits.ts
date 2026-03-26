import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { life } from "@tomos/api";
import type { CreateHabitRequest, UpdateHabitRequest } from "@tomos/api";

export function useHabits(params?: { status?: string; category?: string }) {
  return useQuery({
    queryKey: ["life", "habits", params],
    queryFn: () => life.getHabits(params),
    select: (res) => res.data,
  });
}

export function useHabitCheckIn() {
  return useQuery({
    queryKey: ["life", "habits", "check-in"],
    queryFn: () => life.getHabitCheckIn(),
    staleTime: 60 * 1000,
    select: (res) => res.data,
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHabitRequest) => life.createHabit(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["life", "habits"] });
      qc.invalidateQueries({ queryKey: ["life", "today"] });
    },
  });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHabitRequest }) =>
      life.updateHabit(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["life", "habits"] });
    },
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => life.deleteHabit(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["life", "habits"] });
      qc.invalidateQueries({ queryKey: ["life", "today"] });
    },
  });
}

export function useLogHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      date,
      completed,
      notes,
    }: {
      id: string;
      date: string;
      completed: boolean;
      notes?: string;
    }) => life.logHabit(id, { date, completed, notes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["life", "habits"] });
      qc.invalidateQueries({ queryKey: ["life", "today"] });
    },
  });
}

export function useBatchCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { habitIds: string[]; date?: string }) =>
      life.batchCheckIn(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["life", "habits"] });
      qc.invalidateQueries({ queryKey: ["life", "today"] });
    },
  });
}
