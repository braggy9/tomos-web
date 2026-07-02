"use client";

import { useQuery } from "@tanstack/react-query";

const API = "https://tomos-task-api.vercel.app";

// ─── Types ──────────────────────────────────────────────────

export interface TrainingToday {
  hasActivePlan: boolean;
  message?: string;
  block?: { name: string; phase: string };
  week?: {
    id: string;
    weekNumber: number;
    weekType: string | null;
    keyFocus: string | null;
    targetKm: number | null;
    actualKm: number | null;
  };
  todaysSessions: {
    id: string;
    sessionType: string;
    sessionName: string | null;
    targetDistanceKm: number | null;
    targetPaceZone: string | null;
    notes: string | null;
    isOptional: boolean;
    status: string;
  }[];
  weekProgress: {
    planned: number;
    completed: number;
    targetKm: number | null;
    actualKm: number | null;
  };
}

export interface Race {
  id: string;
  name: string;
  date: string;
  distance: string;
  entryStatus: string;
}

export interface RecoveryData {
  sleepQuality: number;
  soreness: number;
  energy: number;
  motivation: number;
  hoursSlept: number | null;
  date: string;
  notes: string | null;
  readinessScore: number | null;
}

export interface RunActivity {
  id: string;
  date: string;
  type: string;
  distance: number;
  duration: number;
  avgPace: number | null;
  avgHeartRate: number | null;
  activityName: string | null;
}

export interface RunningStats {
  last7Days: {
    totalDistance: number;
    totalDuration: number;
    trainingLoad: number;
    sessions: number;
  };
}

export interface TrainingRadar {
  generatedAt: string;
  calendar: {
    configured: boolean;
    error: string | null;
    lookbackDays: number;
    strengthAuditDays: number;
    plannedColorId: string;
    doneColorId: string;
    inspectedEvents: number;
    slippedSessions: {
      id: string;
      title: string;
      sessionType: string;
      start: string;
      daysOverdue: number;
      colorId: string | null;
      sourceUrl: string | null;
    }[];
  };
  raceRadar: {
    windowDays: number;
    nextRace: {
      id: string;
      name: string;
      date: string;
      distance: string | null;
      daysUntil: number;
      entryStatus: string;
    } | null;
    unconfirmedRaces: {
      id: string;
      name: string;
      date: string;
      distance: string | null;
      daysUntil: number;
      entryStatus: string;
      logisticsStatus: string | null;
    }[];
  };
  recoveryCrossCheck: {
    recovery: RecoveryData | null;
    strava: {
      activities: RunActivity[];
      last7Days: RunningStats["last7Days"] | null;
    };
  };
}

// ─── Fetchers ───────────────────────────────────────────────

async function fetchTrainingToday(): Promise<TrainingToday> {
  const res = await fetch(`${API}/api/training/today`);
  if (!res.ok) throw new Error("Failed to fetch training");
  const data = await res.json();
  return data.data;
}

async function fetchRaces(): Promise<Race[]> {
  const res = await fetch(`${API}/api/training/race-logistics`);
  if (!res.ok) throw new Error("Failed to fetch races");
  const data = await res.json();
  return data.data?.races || [];
}

async function fetchRecovery(): Promise<RecoveryData | null> {
  const res = await fetch(`${API}/api/training/recovery`);
  if (!res.ok) throw new Error("Failed to fetch recovery");
  const data = await res.json();
  return data.data || null;
}

async function fetchRecentRun(): Promise<RunActivity | null> {
  const res = await fetch(`${API}/api/gym/running/activities?days=14&limit=1`);
  if (!res.ok) throw new Error("Failed to fetch runs");
  const data = await res.json();
  return data.data?.[0] || null;
}

async function fetchRunningStats(): Promise<RunningStats | null> {
  const res = await fetch(`${API}/api/gym/running/stats?days=7`);
  if (!res.ok) return null;
  const json = await res.json();
  return json.data || json;
}

async function fetchTrainingRadar(): Promise<TrainingRadar> {
  const res = await fetch("/api/training-radar");
  if (!res.ok) throw new Error("Failed to fetch training radar");
  return res.json();
}

// ─── Hooks ──────────────────────────────────────────────────

export function useTrainingToday() {
  return useQuery({
    queryKey: ["training-today"],
    queryFn: fetchTrainingToday,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRaces() {
  return useQuery({
    queryKey: ["races"],
    queryFn: fetchRaces,
    staleTime: 15 * 60 * 1000,
  });
}

export function useRecovery() {
  return useQuery({
    queryKey: ["recovery"],
    queryFn: fetchRecovery,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRecentRun() {
  return useQuery({
    queryKey: ["recent-run"],
    queryFn: fetchRecentRun,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRunningStats() {
  return useQuery({
    queryKey: ["running-stats"],
    queryFn: fetchRunningStats,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTrainingRadar() {
  return useQuery({
    queryKey: ["training-radar"],
    queryFn: fetchTrainingRadar,
    staleTime: 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
