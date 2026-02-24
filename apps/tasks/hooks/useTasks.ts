"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasks } from "@tomos/api";
import type { Task, TaskStatus, TaskPriority, UpdateTaskRequest } from "@tomos/api";

const TASKS_KEY = ["tasks"];

export function useTasks() {
  return useQuery({
    queryKey: TASKS_KEY,
    queryFn: () => tasks.getAllTasks(),
    select: (data) => data.tasks,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => tasks.getTask(id),
    select: (data) => data.task,
  });
}

export function useCreateSubtask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ parentId, taskText }: { parentId: string; taskText: string }) =>
      tasks.createSubtask(parentId, taskText),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
      queryClient.invalidateQueries({ queryKey: ["task", variables.parentId] });
    },
  });
}

export function useFilteredTasks(filters: {
  status?: TaskStatus | "all" | "active";
  priority?: TaskPriority | "all";
  search?: string;
}) {
  const query = useTasks();

  const filtered = query.data?.filter((task) => {
    if (filters.status && filters.status === "active" && task.status === "Done") {
      return false;
    }
    if (filters.status && filters.status !== "all" && filters.status !== "active" && task.status !== filters.status) {
      return false;
    }
    if (filters.priority && filters.priority !== "all" && task.priority !== filters.priority) {
      return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        task.title.toLowerCase().includes(q) ||
        task.context?.some((c) => c.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return { ...query, data: filtered };
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskText: string) =>
      tasks.createTask({ task: taskText, source: "tomos-web" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) =>
      tasks.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tasks.completeTask(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      const previous = queryClient.getQueryData(TASKS_KEY);

      queryClient.setQueryData(TASKS_KEY, (old: { tasks: Task[] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map((t) =>
            t.id === id
              ? { ...t, status: "Done" as const }
              : t
          ),
        };
      });

      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(TASKS_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}

export function useBatchCreateTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskTexts: string[]) =>
      tasks.batchCreateTasks(taskTexts, "tomos-web"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}
