"use client";

import { useState } from "react";
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from "../../hooks/useGoals";
import { Spinner } from "@tomos/ui";
import { useToast } from "@tomos/ui";
import type { GoalCategory, GoalTimeframe } from "@tomos/api";

const categoryColors: Record<string, string> = {
  health: "bg-green-100 text-green-700",
  family: "bg-pink-100 text-pink-700",
  career: "bg-blue-100 text-blue-700",
  financial: "bg-amber-100 text-amber-700",
  creative: "bg-purple-100 text-purple-700",
  social: "bg-cyan-100 text-cyan-700",
  learning: "bg-indigo-100 text-indigo-700",
};

const timeframeLabels: Record<string, string> = {
  weekly: "This week",
  monthly: "This month",
  quarterly: "This quarter",
  yearly: "This year",
};

const progressSteps = [0, 25, 50, 75, 100];

export default function GoalsPage() {
  const { data: goals, isLoading } = useGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const { toast } = useToast();

  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<GoalCategory>("career");
  const [newTimeframe, setNewTimeframe] = useState<GoalTimeframe>("quarterly");

  function handleCreate() {
    if (!newTitle.trim()) return;
    createGoal.mutate(
      { title: newTitle.trim(), category: newCategory, timeframe: newTimeframe },
      {
        onSuccess: () => {
          setNewTitle("");
          setShowAdd(false);
          toast("Goal created");
        },
        onError: () => toast("Failed to create goal", "error"),
      }
    );
  }

  function handleProgress(id: string, progress: number) {
    updateGoal.mutate({
      id,
      data: {
        progress,
        status: progress === 100 ? "completed" : "active",
      },
    });
  }

  function handleDelete(id: string) {
    deleteGoal.mutate(id, {
      onSuccess: () => toast("Goal removed"),
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const activeGoals = goals?.filter((g) => g.status === "active") || [];
  const completedGoals = goals?.filter((g) => g.status === "completed") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Goals</h1>
          <p className="text-sm text-gray-500">{activeGoals.length} active</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          + New
        </button>
      </div>

      {/* Add goal form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What do you want to achieve?"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(categoryColors) as GoalCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setNewCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                  newCategory === cat ? categoryColors[cat] : "bg-gray-100 text-gray-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(timeframeLabels) as GoalTimeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => setNewTimeframe(tf)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  newTimeframe === tf
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {timeframeLabels[tf]}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim() || createGoal.isPending}
              className="px-4 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {createGoal.isPending ? "Creating..." : "Create"}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active goals */}
      {activeGoals.length > 0 ? (
        <div className="space-y-3">
          {activeGoals.map((goal) => (
            <div key={goal.id} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-gray-800">{goal.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${categoryColors[goal.category] || "bg-gray-100 text-gray-600"}`}>
                      {goal.category}
                    </span>
                    <span className="text-[10px] text-gray-400">{timeframeLabels[goal.timeframe]}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{goal.progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full transition-all duration-300"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>
              </div>

              {/* Quick progress buttons */}
              <div className="flex gap-1.5">
                {progressSteps.map((step) => (
                  <button
                    key={step}
                    onClick={() => handleProgress(goal.id, step)}
                    className={`flex-1 py-1 rounded text-[10px] font-medium transition-colors ${
                      goal.progress >= step
                        ? "bg-brand-100 text-brand-700"
                        : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    {step}%
                  </button>
                ))}
              </div>

              {/* Linked habits */}
              {goal.habits && goal.habits.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {goal.habits.map((h) => (
                    <span key={h.id} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {h.icon || "+"} {h.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        !showAdd && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">{"\uD83C\uDFAF"}</p>
            <p className="text-gray-500 text-sm">No active goals</p>
            <p className="text-gray-400 text-xs mt-1">Set a goal to start tracking progress</p>
          </div>
        )
      )}

      {/* Completed goals */}
      {completedGoals.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Completed ({completedGoals.length})
          </h2>
          <div className="space-y-2 opacity-60">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 px-3 py-2.5">
                <span className="text-green-500">{"\u2713"}</span>
                <span className="flex-1 text-sm text-gray-500 line-through">{goal.title}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${categoryColors[goal.category] || "bg-gray-100 text-gray-600"}`}>
                  {goal.category}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
