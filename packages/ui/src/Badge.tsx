"use client";

import React from "react";

type BadgeVariant = "priority" | "status" | "tag" | "context";

const priorityStyles: Record<string, string> = {
  // API values (capitalized)
  Urgent: "bg-red-100 text-red-700 border-red-200",
  Important: "bg-orange-100 text-orange-700 border-orange-200",
  Someday: "bg-gray-100 text-gray-600 border-gray-200",
  // Lowercase fallbacks
  urgent: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-blue-100 text-blue-700 border-blue-200",
  low: "bg-gray-100 text-gray-600 border-gray-200",
};

const statusStyles: Record<string, string> = {
  // API values
  Inbox: "bg-violet-100 text-violet-700 border-violet-200",
  "In Progress": "bg-blue-100 text-blue-700 border-blue-200",
  Done: "bg-green-100 text-green-700 border-green-200",
  // Lowercase fallbacks
  todo: "bg-violet-100 text-violet-700 border-violet-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  done: "bg-green-100 text-green-700 border-green-200",
  blocked: "bg-red-100 text-red-700 border-red-200",
  // Matter statuses
  active: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  on_hold: "bg-amber-100 text-amber-700 border-amber-200",
  archived: "bg-gray-100 text-gray-600 border-gray-200",
  draft: "bg-gray-100 text-gray-500 border-gray-200",
};

interface BadgeProps {
  variant?: BadgeVariant;
  value: string;
  className?: string;
}

export function Badge({ variant = "tag", value, className = "" }: BadgeProps) {
  if (!value) return null;

  let styles = "bg-gray-100 text-gray-600 border-gray-200";

  if (variant === "priority") {
    styles = priorityStyles[value] ?? styles;
  } else if (variant === "status") {
    styles = statusStyles[value] ?? styles;
  } else if (variant === "context") {
    styles = "bg-violet-50 text-violet-600 border-violet-200";
  }

  const label = value.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${styles} ${className}`}
    >
      {label}
    </span>
  );
}
