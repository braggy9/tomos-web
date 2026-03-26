"use client";

import { useQuery } from "@tanstack/react-query";

const API = "https://tomos-task-api.vercel.app";

export interface ParentingWeek {
  startDate: string;
  endDate: string;
  status: string; // "kids" | "solo"
  raceNote: string | null;
  hasRaceConflict: boolean;
}

async function fetchParentingSchedule(): Promise<ParentingWeek[]> {
  const res = await fetch(`${API}/api/training/parenting-schedule`);
  if (!res.ok) throw new Error("Failed to fetch parenting schedule");
  const data = await res.json();
  return data.data?.weeks || data.data || [];
}

export function useParentingSchedule() {
  return useQuery({
    queryKey: ["parenting-schedule"],
    queryFn: fetchParentingSchedule,
    staleTime: 30 * 60 * 1000,
  });
}

/** Returns "kids" | "solo" | null for the current week */
export function useCurrentWeekType() {
  const { data: weeks } = useParentingSchedule();

  if (!weeks || weeks.length === 0) return null;

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const currentWeek = weeks.find((w) => {
    return todayStr >= w.startDate && todayStr <= w.endDate;
  });

  return currentWeek?.status || null;
}
