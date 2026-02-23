import { get, post, patch } from "./client";
import type {
  AllTasksResponse,
  CreateTaskRequest,
  CreateTaskResponse,
  UpdateTaskRequest,
  Task,
} from "./types";

export async function getAllTasks(): Promise<AllTasksResponse> {
  return get<AllTasksResponse>("/api/all-tasks");
}

export async function createTask(input: CreateTaskRequest): Promise<CreateTaskResponse> {
  return post<CreateTaskResponse>("/api/task", input);
}

export async function updateTask(
  id: string,
  data: UpdateTaskRequest
): Promise<{ success: boolean; taskId: string; message: string }> {
  return patch(`/api/task/${id}`, data);
}

export async function completeTask(
  id: string
): Promise<{ success: boolean; taskId: string; message: string }> {
  return patch(`/api/task/${id}/complete`);
}

export async function batchCreateTasks(
  tasks: string[],
  source?: string
): Promise<{ success: boolean; created: number; tasks: Task[] }> {
  return post("/api/task/batch", { tasks, source: source ?? "tomos-web" });
}

export async function getSmartSurface(): Promise<{
  success: boolean;
  recommendations: Array<{
    taskId?: string;
    title: string;
    reason: string;
    score: number;
    priority: string;
    source: string;
  }>;
}> {
  return get("/api/task/smart-surface");
}
