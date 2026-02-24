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
  const isDone = task.status === "Done";

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
        className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all ${
          isDone
            ? "bg-green-500 border-green-500"
            : "border-gray-300 hover:border-violet-500 hover:bg-violet-50 hover:scale-110"
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
          {task.priority && <Badge variant="priority" value={task.priority} />}
          {task.status !== "Done" && <Badge variant="status" value={task.status} />}
          {task.context?.map((ctx) => (
            <Badge key={ctx} variant="context" value={ctx} />
          ))}
          {(task.subtaskCount ?? 0) > 0 && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-violet-50 text-violet-600 border border-violet-100">
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
              {task.subtaskCount}
            </span>
          )}
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
