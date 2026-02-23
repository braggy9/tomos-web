"use client";

import Link from "next/link";
import type { Task } from "@tomos/api";
import { Badge } from "@tomos/ui";
import { useCompleteTask } from "../hooks/useTasks";
import { useToast } from "@tomos/ui";

interface TaskRowProps {
  task: Task;
}

export function TaskRow({ task }: TaskRowProps) {
  const complete = useCompleteTask();
  const { toast } = useToast();
  const isDone = task.status === "done";

  const handleComplete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDone) return;
    complete.mutate(task.id, {
      onSuccess: () => toast("Task completed"),
      onError: () => toast("Failed to complete task", "error"),
    });
  };

  const dueLabel = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-AU", {
        day: "numeric",
        month: "short",
      })
    : null;

  const isOverdue =
    task.dueDate && !isDone && new Date(task.dueDate) < new Date();

  return (
    <Link
      href={`/${task.id}`}
      className="flex items-start gap-3 px-4 py-3 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors active:bg-gray-100"
    >
      {/* Complete button */}
      <button
        onClick={handleComplete}
        disabled={isDone}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors ${
          isDone
            ? "bg-green-500 border-green-500"
            : "border-gray-300 hover:border-brand-500"
        }`}
        aria-label={isDone ? "Completed" : "Mark complete"}
      >
        {isDone && (
          <svg className="w-full h-full text-white p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium truncate ${
              isDone ? "line-through text-gray-400" : "text-gray-900"
            }`}
          >
            {task.title}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge variant="priority" value={task.priority} />
          {task.status !== "done" && <Badge variant="status" value={task.status} />}
          {task.project && (
            <span
              className="inline-flex items-center gap-1 text-xs text-gray-500"
              style={task.project.color ? { color: task.project.color } : undefined}
            >
              {task.project.title}
            </span>
          )}
          {task.tags.map((t) => (
            <Badge key={t.tag.id} value={t.tag.name} />
          ))}
        </div>
      </div>

      {/* Due date */}
      {dueLabel && (
        <span
          className={`text-xs font-medium flex-shrink-0 mt-0.5 ${
            isOverdue ? "text-red-600" : "text-gray-500"
          }`}
        >
          {dueLabel}
        </span>
      )}
    </Link>
  );
}
