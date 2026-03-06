import { get, post, patch } from "./client";
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
  UserSettings,
  RunningActivity,
  RunningActivityDetail,
  ActivityStreams,
  RunSession,
  CreateRunSessionRequest,
  TodayRunStatus,
  WeeklyDashboard,
  HRZone,
  ZoneTime,
  CoachTodaySnapshot,
  CoachWeek,
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

export async function getRunningActivities(params?: {
  days?: number;
  limit?: number;
  offset?: number;
}): Promise<{ success: boolean; data: RunningActivity[]; pagination: Pagination }> {
  return get("/api/gym/running/activities", params);
}

export async function getRunningActivity(
  id: string
): Promise<{ success: boolean; data: RunningActivityDetail }> {
  return get(`/api/gym/running/activities/${id}`);
}

export async function getActivityStreams(
  id: string
): Promise<{ success: boolean; data: ActivityStreams; cached: boolean }> {
  return get(`/api/gym/running/activities/${id}/streams`);
}

export async function createRunSession(
  data: CreateRunSessionRequest
): Promise<{ success: boolean; data: RunSession }> {
  return post("/api/gym/running/sessions", data);
}

export async function getTodayRun(): Promise<{
  success: boolean;
  data: TodayRunStatus;
}> {
  return get("/api/gym/running/today");
}

export async function getHRZones(activityId?: string): Promise<{
  success: boolean;
  data: { maxHeartRate: number; restingHR: number | null; zones: HRZone[]; zoneTime: ZoneTime[] | null };
}> {
  return get("/api/gym/running/zones", activityId ? { activityId } : undefined);
}

// ─── Settings ──────────────────────────────────

export async function getSettings(): Promise<{
  success: boolean;
  data: UserSettings;
}> {
  return get("/api/gym/settings");
}

export async function updateSettings(
  data: Partial<Omit<UserSettings, "id">>
): Promise<{ success: boolean; data: UserSettings }> {
  return patch("/api/gym/settings", data);
}

// ─── Dashboard ─────────────────────────────────

export async function getWeeklyDashboard(): Promise<{
  success: boolean;
  data: WeeklyDashboard;
}> {
  return get("/api/gym/dashboard/weekly");
}

// ─── Manual Sync ───────────────────────────────

export async function triggerManualSync(): Promise<{
  success: boolean;
  data: { synced: number; skipped: number; enriched: number };
}> {
  return post("/api/gym/sync/strava/manual");
}

// ─── Coach ──────────────────────────────────────

export async function getCoachToday(): Promise<{
  success: boolean;
  data: CoachTodaySnapshot;
}> {
  return get("/api/gym/coach/today");
}

export async function getCoachWeek(weekOffset?: number): Promise<{
  success: boolean;
  data: CoachWeek;
}> {
  return get("/api/gym/coach/week", weekOffset != null ? { weekOffset } : undefined);
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
