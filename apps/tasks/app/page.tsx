"use client";

import { useState } from "react";
import type { TaskStatus, TaskPriority } from "@tomos/api";
import { useFilteredTasks } from "../hooks/useTasks";
import { QuickAdd } from "../components/QuickAdd";
import { TaskFilters } from "../components/TaskFilters";
import { TaskList } from "../components/TaskList";
import { AppSwitcher } from "../components/AppSwitcher";
import { TodaySchedule } from "../components/TodaySchedule";

export default function TasksPage() {
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [priority, setPriority] = useState<TaskPriority | "all">("all");
  const [search, setSearch] = useState("");

  const { data: tasks, isLoading, error } = useFilteredTasks({
    status,
    priority,
    search,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Tasks</h1>
          <AppSwitcher />
        </div>
        {tasks && (
          <span className="text-sm text-gray-500">{tasks.length} tasks</span>
        )}
      </div>

      <TodaySchedule />

      <QuickAdd />

      <TaskFilters
        status={status}
        priority={priority}
        search={search}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
        onSearchChange={setSearch}
      />

      <TaskList tasks={tasks} isLoading={isLoading} error={error} />
    </div>
  );
}
