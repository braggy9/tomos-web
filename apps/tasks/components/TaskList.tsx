"use client";

import { EmptyState, Spinner } from "@tomos/ui";
import type { Task } from "@tomos/api";
import { TaskRow } from "./TaskRow";

interface TaskListProps {
  tasks?: Task[];
  isLoading: boolean;
  error: Error | null;
}

export function TaskList({ tasks, isLoading, error }: TaskListProps) {
  if (isLoading) {
    return <Spinner className="py-12" />;
  }

  if (error) {
    return (
      <EmptyState
        title="Failed to load tasks"
        description={error.message}
      />
    );
  }

  if (!tasks || tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks found"
        description="Create a task to get started"
        icon={
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    );
  }

  // Filter out subtasks from the main list (they show on parent's detail page)
  const topLevelTasks = tasks.filter((t) => !t.parentId);

  if (topLevelTasks.length === 0) {
    return (
      <EmptyState
        title="No tasks found"
        description="Create a task to get started"
        icon={
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
      {topLevelTasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </div>
  );
}
