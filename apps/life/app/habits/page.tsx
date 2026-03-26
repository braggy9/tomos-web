"use client";

import { useState } from "react";
import { useHabits, useCreateHabit, useLogHabit, useHabitCheckIn } from "../../hooks/useHabits";
import { HabitRow } from "../../components/HabitRow";
import { Spinner } from "@tomos/ui";
import { useToast } from "@tomos/ui";
import type { HabitFrequency } from "@tomos/api";

const frequencyLabels: Record<string, string> = {
  daily: "Daily",
  weekdays: "Weekdays",
  weekends: "Weekends",
  mon_wed_fri: "Mon/Wed/Fri",
  tue_thu: "Tue/Thu",
  custom: "Custom",
};

export default function HabitsPage() {
  const { data: checkIns, isLoading } = useHabitCheckIn();
  const { data: allHabits } = useHabits();
  const createHabit = useCreateHabit();
  const logHabit = useLogHabit();
  const { toast } = useToast();

  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newFrequency, setNewFrequency] = useState<HabitFrequency>("daily");
  const [newIcon, setNewIcon] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const todayISO = new Date().toLocaleDateString("en-CA", { timeZone: "Australia/Sydney" });

  function handleToggle(habitId: string, completed: boolean) {
    logHabit.mutate(
      { id: habitId, date: todayISO, completed },
      { onError: () => toast("Failed to log habit", "error") }
    );
  }

  function handleCreate() {
    if (!newTitle.trim()) return;
    createHabit.mutate(
      {
        title: newTitle.trim(),
        frequency: newFrequency,
        icon: newIcon || undefined,
        category: newCategory || undefined,
      },
      {
        onSuccess: () => {
          setNewTitle("");
          setNewIcon("");
          setNewCategory("");
          setShowAdd(false);
          toast("Habit created");
        },
        onError: () => toast("Failed to create habit", "error"),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const activeCount = allHabits?.length || 0;
  const completedCount = checkIns?.filter((c) => c.completedToday).length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Habits</h1>
          <p className="text-sm text-gray-500">
            {completedCount}/{activeCount} completed today
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          + New
        </button>
      </div>

      {/* Add habit form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Habit name..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <div className="flex gap-2 flex-wrap">
            {Object.entries(frequencyLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setNewFrequency(key as HabitFrequency)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  newFrequency === key
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              placeholder="Icon (emoji)"
              className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Category (optional)"
              className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim() || createHabit.isPending}
              className="px-4 py-1.5 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {createHabit.isPending ? "Creating..." : "Create"}
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

      {/* Habits list */}
      {checkIns && checkIns.length > 0 ? (
        <div className="space-y-2">
          {checkIns.map((item) => (
            <HabitRow
              key={item.habit.id}
              id={item.habit.id}
              title={item.habit.title}
              icon={item.habit.icon}
              streak={item.streak}
              completedToday={item.completedToday}
              onToggle={handleToggle}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">{"\uD83C\uDF31"}</p>
          <p className="text-gray-500 text-sm">No habits yet</p>
          <p className="text-gray-400 text-xs mt-1">Tap + New to start building your routine</p>
        </div>
      )}

      {/* Progress bar */}
      {activeCount > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Today&apos;s progress</span>
            <span>{Math.round((completedCount / activeCount) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-600 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / activeCount) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
