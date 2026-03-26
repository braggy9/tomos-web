"use client";

import { useQuery } from "@tanstack/react-query";

export interface TodoistTask {
  id: string;
  content: string;
  project: string;
  priority: string;
  due: string | null;
  dueDate: string | null;
  isOverdue: boolean;
  labels: string[];
  url: string;
}

async function fetchTasks(): Promise<TodoistTask[]> {
  const res = await fetch("/api/todoist");
  if (!res.ok) throw new Error("Failed to fetch tasks");
  const data = await res.json();
  return data.tasks;
}

export function useTodoist() {
  return useQuery({
    queryKey: ["todoist-tasks"],
    queryFn: fetchTasks,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}
