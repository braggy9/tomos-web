"use client";

import { useState, useRef } from "react";
import { useCreateTask } from "../hooks/useTasks";
import { useToast } from "@tomos/ui";

export function QuickAdd() {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const createTask = useCreateTask();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    createTask.mutate(trimmed, {
      onSuccess: () => {
        setText("");
        toast("Task created");
        inputRef.current?.focus();
      },
      onError: () => toast("Failed to create task", "error"),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a task... (e.g. Review contract tomorrow #urgent)"
          disabled={createTask.isPending}
          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none disabled:opacity-50"
        />
      </div>
      <button
        type="submit"
        disabled={!text.trim() || createTask.isPending}
        className="px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 disabled:pointer-events-none transition-colors flex-shrink-0"
      >
        {createTask.isPending ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
