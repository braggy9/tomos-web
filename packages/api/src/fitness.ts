import { get, post } from "./client";
import type {
  FitnessDailyPlan,
  FitnessSessionSuggestion,
  FitnessSession,
  FitnessExercise,
  FitnessRecoveryCheckIn,
  FitnessNutritionLog,
  FitnessProgressData,
  FitnessProgressSummary,
  FitnessRunningStats,
  FitnessRunningLoadContext,
  CreateRecoveryCheckInRequest,
  CreateNutritionLogRequest,
  FitnessQuickLogRequest,
  ApiResponse,
} from "./types";

// ─── Daily Plan ──────────────────────────────────
export async function getDailyPlan(weekType?: string, equipment?: string[]): Promise<ApiResponse<FitnessDailyPlan>> {
  const params: Record<string, string> = {};
  if (weekType) params.weekType = weekType;
  if (equipment?.length) params.equipment = equipment.join(",");
  return get("/api/gym/daily-plan", Object.keys(params).length > 0 ? params : undefined);
}

// ─── Session Suggestion ──────────────────────────
export async function getSuggestion(weekType?: string, equipment?: string[]): Promise<ApiResponse<FitnessSessionSuggestion>> {
  const params: Record<string, string> = {};
  if (weekType) params.weekType = weekType;
  if (equipment?.length) params.equipment = equipment.join(",");
  return get("/api/gym/suggest", Object.keys(params).length > 0 ? params : undefined);
}

// ─── Sessions ────────────────────────────────────
export async function getSessions(limit?: number): Promise<ApiResponse<FitnessSession[]>> {
  return get("/api/gym/sessions", { limit: limit ?? 50 });
}

export async function getSession(id: string): Promise<ApiResponse<FitnessSession>> {
  return get(`/api/gym/sessions/${id}`);
}

export async function quickLog(data: FitnessQuickLogRequest): Promise<ApiResponse<FitnessSession>> {
  return post("/api/gym/log", data);
}

// ─── Exercises ───────────────────────────────────
export async function getExercises(): Promise<ApiResponse<FitnessExercise[]>> {
  return get("/api/gym/exercises");
}

// ─── Recovery ────────────────────────────────────
export async function getTodayRecovery(): Promise<ApiResponse<FitnessRecoveryCheckIn | null>> {
  return get("/api/gym/recovery/today");
}

export async function getRecoveryHistory(limit?: number): Promise<ApiResponse<FitnessRecoveryCheckIn[]>> {
  return get("/api/gym/recovery", { limit: limit ?? 30 });
}

export async function createRecoveryCheckIn(data: CreateRecoveryCheckInRequest): Promise<ApiResponse<FitnessRecoveryCheckIn>> {
  return post("/api/gym/recovery", data);
}

// ─── Progress ────────────────────────────────────
export async function getProgress(exerciseId: string, period?: number): Promise<ApiResponse<FitnessProgressData>> {
  return get("/api/gym/progress", { exerciseId, period: period ?? 90 });
}

export async function getProgressSummary(): Promise<ApiResponse<FitnessProgressSummary>> {
  return get("/api/gym/progress/summary");
}

// ─── Nutrition ───────────────────────────────────
export async function getNutritionLogs(limit?: number): Promise<ApiResponse<FitnessNutritionLog[]>> {
  return get("/api/gym/nutrition", { limit: limit ?? 30 });
}

export async function createNutritionLog(data: CreateNutritionLogRequest): Promise<ApiResponse<FitnessNutritionLog>> {
  return post("/api/gym/nutrition", data);
}

export async function getNutritionNudge(): Promise<ApiResponse<{ nudge: string }>> {
  return get("/api/gym/nutrition/nudge");
}

// ─── Running ─────────────────────────────────────
export async function getRunningStats(): Promise<ApiResponse<FitnessRunningStats>> {
  return get("/api/gym/running/stats");
}
