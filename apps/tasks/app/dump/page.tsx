"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@tomos/ui";
import { useToast } from "@tomos/ui";
import { useBatchCreateTasks } from "../../hooks/useTasks";

export default function BrainDumpPage() {
  const [text, setText] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const batch = useBatchCreateTasks();

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const handleSubmit = () => {
    if (lines.length === 0) return;

    batch.mutate(lines, {
      onSuccess: (data) => {
        toast(`Created ${data.created} tasks`);
        setText("");
        router.push("/");
      },
      onError: () => toast("Failed to create tasks", "error"),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900">Brain Dump</h1>
      </div>

      <p className="text-sm text-gray-500">
        Write one task per line. Each line becomes a separate task.
      </p>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder={`Review quarterly report\nCall dentist about appointment\nBuy groceries #low\nDraft response to client email #urgent\nResearch new project management tools`}
          className="w-full text-sm border-0 focus:outline-none resize-y placeholder:text-gray-300"
          autoFocus
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {lines.length} {lines.length === 1 ? "task" : "tasks"} to create
        </span>
        <Button
          onClick={handleSubmit}
          disabled={lines.length === 0}
          loading={batch.isPending}
        >
          Create {lines.length > 0 ? lines.length : ""} Tasks
        </Button>
      </div>
    </div>
  );
}
