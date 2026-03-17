import { get, post, patch, del } from "./client";
import type {
  Goal,
  Habit,
  HabitLog,
  HabitCheckIn,
  ShoppingItem,
  WeeklyPlan,
  TodaySnapshot,
  CreateGoalRequest,
  UpdateGoalRequest,
  CreateHabitRequest,
  UpdateHabitRequest,
  CreateShoppingItemRequest,
  UpdateShoppingItemRequest,
  CreateWeeklyPlanRequest,
  UpdateWeeklyPlanRequest,
} from "./types";

// ─── Goals ──────────────────────────────────────

export async function getGoals(params?: {
  status?: string;
  category?: string;
  timeframe?: string;
}): Promise<{ success: boolean; data: Goal[] }> {
  return get("/api/life/goals", params);
}

export async function getGoal(
  id: string
): Promise<{ success: boolean; data: Goal }> {
  return get(`/api/life/goals/${id}`);
}

export async function createGoal(
  data: CreateGoalRequest
): Promise<{ success: boolean; data: Goal }> {
  return post("/api/life/goals", data);
}

export async function updateGoal(
  id: string,
  data: UpdateGoalRequest
): Promise<{ success: boolean; data: Goal }> {
  return patch(`/api/life/goals/${id}`, data);
}

export async function deleteGoal(
  id: string
): Promise<{ success: boolean }> {
  return del(`/api/life/goals/${id}`);
}

// ─── Habits ─────────────────────────────────────

export async function getHabits(params?: {
  status?: string;
  category?: string;
}): Promise<{ success: boolean; data: Habit[] }> {
  return get("/api/life/habits", params);
}

export async function getHabit(
  id: string
): Promise<{ success: boolean; data: Habit }> {
  return get(`/api/life/habits/${id}`);
}

export async function createHabit(
  data: CreateHabitRequest
): Promise<{ success: boolean; data: Habit }> {
  return post("/api/life/habits", data);
}

export async function updateHabit(
  id: string,
  data: UpdateHabitRequest
): Promise<{ success: boolean; data: Habit }> {
  return patch(`/api/life/habits/${id}`, data);
}

export async function deleteHabit(
  id: string
): Promise<{ success: boolean }> {
  return del(`/api/life/habits/${id}`);
}

export async function logHabit(
  id: string,
  data: { date: string; completed?: boolean; notes?: string }
): Promise<{ success: boolean; data: HabitLog }> {
  return post(`/api/life/habits/${id}/log`, data);
}

export async function getHabitCheckIn(): Promise<{
  success: boolean;
  data: HabitCheckIn[];
}> {
  return get("/api/life/habits/check-in");
}

export async function batchCheckIn(
  data: { habitIds: string[]; date?: string }
): Promise<{ success: boolean; data: HabitLog[] }> {
  return post("/api/life/habits/check-in", data);
}

// ─── Shopping ───────────────────────────────────

export async function getShoppingItems(params?: {
  listId?: string;
  checked?: boolean;
}): Promise<{ success: boolean; data: ShoppingItem[] }> {
  return get("/api/life/shopping", params);
}

export async function addShoppingItem(
  data: CreateShoppingItemRequest | CreateShoppingItemRequest[]
): Promise<{ success: boolean; data: ShoppingItem | ShoppingItem[] }> {
  return post("/api/life/shopping", data);
}

export async function updateShoppingItem(
  id: string,
  data: UpdateShoppingItemRequest
): Promise<{ success: boolean; data: ShoppingItem }> {
  return patch(`/api/life/shopping/${id}`, data);
}

export async function deleteShoppingItem(
  id: string
): Promise<{ success: boolean }> {
  return del(`/api/life/shopping/${id}`);
}

export async function checkShoppingItem(
  data: { id: string } | { ids: string[] }
): Promise<{ success: boolean }> {
  return post("/api/life/shopping/check", data);
}

export async function clearCheckedItems(): Promise<{
  success: boolean;
  data: { deleted: number };
}> {
  return post("/api/life/shopping/clear");
}

export async function parseShoppingText(
  text: string
): Promise<{ success: boolean; data: ShoppingItem[] }> {
  return post("/api/life/shopping/parse", { text });
}

// ─── Weekly Plans ───────────────────────────────

export async function getPlans(params?: {
  status?: string;
}): Promise<{ success: boolean; data: WeeklyPlan[] }> {
  return get("/api/life/plans", params);
}

export async function getCurrentPlan(): Promise<{
  success: boolean;
  data: WeeklyPlan;
}> {
  return get("/api/life/plans/current");
}

export async function createPlan(
  data: CreateWeeklyPlanRequest
): Promise<{ success: boolean; data: WeeklyPlan }> {
  return post("/api/life/plans", data);
}

export async function updatePlan(
  id: string,
  data: UpdateWeeklyPlanRequest
): Promise<{ success: boolean; data: WeeklyPlan }> {
  return patch(`/api/life/plans/${id}`, data);
}

// ─── Dashboard ──────────────────────────────────

export async function getToday(): Promise<{
  success: boolean;
  data: TodaySnapshot;
}> {
  return get("/api/life/today");
}
