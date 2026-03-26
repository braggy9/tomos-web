"use client";

import { useQuery } from "@tanstack/react-query";

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
  allDay: boolean;
  status: "past" | "current" | "future";
}

async function fetchCalendar(): Promise<{
  events: CalendarEvent[];
  configured: boolean;
}> {
  const res = await fetch("/api/calendar/today");
  if (!res.ok) throw new Error("Failed to fetch calendar");
  return res.json();
}

export function useCalendar() {
  return useQuery({
    queryKey: ["calendar-today"],
    queryFn: fetchCalendar,
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
