import { get, post } from "./client";
import type {
  GymSession,
  SessionSuggestion,
  RunningStats,
  RecoveryCheckin,
  Exercise,
  QuickLogRequest,
  CreateRecoveryRequest,
  Pagination,
  WeekType,
} from "./types";

// ─── Sessions ───────────────────────────────────

export async function getSessions(params?: {
  type?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}): Promise<{ success: boolean; data: GymSession[]; pagination: Pagination }> {
  return get("/api/gym/sessions", params);
}

export async function getSession(
  id: string
): Promise<{ success: boolean; data: GymSession }> {
  return get(`/api/gym/sessions/${id}`);
}

export async function quickLog(
  data: QuickLogRequest
): Promise<{ success: boolean; data: GymSession }> {
  return post("/api/gym/log", data);
}

// ─── Suggestions ────────────────────────────────

export async function getSuggestion(
  weekType?: WeekType
): Promise<{ success: boolean; data: SessionSuggestion }> {
  return get("/api/gym/suggest", weekType ? { weekType } : undefined);
}

// ─── Exercises ──────────────────────────────────

export async function getExercises(params?: {
  category?: string;
  movement?: string;
  search?: string;
}): Promise<{ success: boolean; data: Exercise[] }> {
  return get("/api/gym/exercises", params);
}

// ─── Running ────────────────────────────────────

export async function getRunningStats(): Promise<{
  success: boolean;
  data: RunningStats;
}> {
  return get("/api/gym/running/stats");
}

// ─── Recovery ───────────────────────────────────

export async function getRecoveryCheckins(
  days?: number
): Promise<{ success: boolean; data: RecoveryCheckin[] }> {
  return get("/api/gym/recovery", days ? { days } : undefined);
}

export async function submitRecovery(
  data: CreateRecoveryRequest
): Promise<{ success: boolean; data: RecoveryCheckin }> {
  return post("/api/gym/recovery", data);
}
