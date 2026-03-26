"use client";

import { useQuery } from "@tanstack/react-query";

const API = "https://tomos-task-api.vercel.app";

export interface JournalInsights {
  stats: {
    totalEntries: number;
    currentStreak: number;
    entriesPerWeek: number;
  };
  moodTimeline: { date: string; mood: string; energy?: string | null }[];
}

export interface JournalEntry {
  id: string;
  title?: string | null;
  mood?: string | null;
  energy?: string | null;
  entryDate: string;
}

async function fetchInsights(): Promise<JournalInsights> {
  const res = await fetch(`${API}/api/journal/insights?days=7`);
  if (!res.ok) throw new Error("Failed to fetch insights");
  const data = await res.json();
  return data.data;
}

async function fetchLatestEntry(): Promise<JournalEntry | null> {
  const res = await fetch(`${API}/api/journal/entries?limit=1`);
  if (!res.ok) throw new Error("Failed to fetch entries");
  const data = await res.json();
  return data.data?.[0] || null;
}

export function useJournalInsights() {
  return useQuery({
    queryKey: ["journal-insights"],
    queryFn: fetchInsights,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLatestEntry() {
  return useQuery({
    queryKey: ["journal-latest"],
    queryFn: fetchLatestEntry,
    staleTime: 5 * 60 * 1000,
  });
}
