import { get, patch } from "./client";
import type {
  TrainingBlock,
  TrainingWeek,
  TrainingWeekWithProgress,
  TodayTrainingPlan,
  PlannedSession,
} from "./types";

// ─── Blocks ────────────────────────────────────

export async function getBlocks(
  status?: string
): Promise<{ success: boolean; data: TrainingBlock[] }> {
  return get("/api/training/blocks", status ? { status } : undefined);
}

export async function getBlock(
  id: string
): Promise<{ success: boolean; data: TrainingBlock }> {
  return get(`/api/training/blocks/${id}`);
}

export async function updateBlock(
  id: string,
  data: Partial<{ name: string; phase: string; status: string; notes: string }>
): Promise<{ success: boolean; data: TrainingBlock }> {
  return patch(`/api/training/blocks/${id}`, data);
}

// ─── Weeks ─────────────────────────────────────

export async function getCurrentWeek(): Promise<{
  success: boolean;
  data: TrainingWeekWithProgress | null;
  message?: string;
}> {
  return get("/api/training/weeks/current");
}

export async function updateWeek(
  id: string,
  data: Partial<{ weekType: string; notes: string; actualKm: number; status: string }>
): Promise<{ success: boolean; data: TrainingWeek }> {
  return patch(`/api/training/weeks/${id}`, data);
}

// ─── Sessions ──────────────────────────────────

export async function updatePlannedSession(
  id: string,
  data: Partial<{ status: string; linkedRunId: string; linkedGymSessionId: string; notes: string }>
): Promise<{ success: boolean; data: PlannedSession }> {
  return patch(`/api/training/sessions/${id}`, data);
}

// ─── Today ─────────────────────────────────────

export async function getToday(): Promise<{
  success: boolean;
  data: TodayTrainingPlan;
}> {
  return get("/api/training/today");
}
