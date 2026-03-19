import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { training } from "@tomos/api";

export function useRaceLogistics() {
  return useQuery({
    queryKey: ["training", "race-logistics"],
    queryFn: () => training.getRaceLogistics(),
    select: (res) => res.data,
    staleTime: 10 * 60 * 1000, // 10 min (backend caches 15 min)
  });
}

export function useParentingSchedule() {
  return useQuery({
    queryKey: ["training", "parenting-schedule"],
    queryFn: () => training.getParentingSchedule(),
    select: (res) => res.data,
    staleTime: 10 * 60 * 1000,
  });
}

export function useRefreshRaceData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => training.getRaceLogistics(true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training", "race-logistics"] });
      queryClient.invalidateQueries({ queryKey: ["training", "parenting-schedule"] });
    },
  });
}

export function useUpdateRaceCosts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ raceId, data }: { raceId: string; data: Parameters<typeof training.updateRaceCosts>[1] }) =>
      training.updateRaceCosts(raceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training", "race-logistics"] });
    },
  });
}
