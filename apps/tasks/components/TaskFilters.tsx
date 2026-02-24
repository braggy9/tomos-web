"use client";

import type { TaskStatus, TaskPriority } from "@tomos/api";

interface TaskFiltersProps {
  status: TaskStatus | "all" | "active";
  priority: TaskPriority | "all";
  search: string;
  onStatusChange: (status: TaskStatus | "all" | "active") => void;
  onPriorityChange: (priority: TaskPriority | "all") => void;
  onSearchChange: (search: string) => void;
}

const statusOptions: Array<{ value: TaskStatus | "all" | "active"; label: string }> = [
  { value: "active", label: "Active" },
  { value: "all", label: "All" },
  { value: "Inbox", label: "Inbox" },
  { value: "In Progress", label: "In Progress" },
  { value: "Done", label: "Done" },
];

const priorityOptions: Array<{ value: TaskPriority | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "Urgent", label: "Urgent" },
  { value: "Important", label: "Important" },
  { value: "Someday", label: "Someday" },
];

export function TaskFilters({
  status,
  priority,
  search,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
}: TaskFiltersProps) {
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-4 overflow-x-auto">
        {/* Status */}
        <div className="flex gap-1 flex-shrink-0">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onStatusChange(opt.value)}
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                status === opt.value
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Priority */}
        <div className="flex gap-1 flex-shrink-0">
          {priorityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onPriorityChange(opt.value)}
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                priority === opt.value
                  ? "bg-violet-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
