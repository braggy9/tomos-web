import { useQuery } from "@tanstack/react-query";
import { life } from "@tomos/api";

export function useLifeToday() {
  return useQuery({
    queryKey: ["life", "today"],
    queryFn: () => life.getToday(),
    staleTime: 2 * 60 * 1000,
    select: (res) => res.data,
  });
}
