"use client";

import { useState } from "react";
import { useCurrentPlan, useUpdatePlan } from "../../hooks/usePlans";
import { PriorityCard } from "../../components/PriorityCard";
import { Spinner } from "@tomos/ui";
import { useToast } from "@tomos/ui";
import type { WeeklyPlanPriority, WeeklyPlanIntention } from "@tomos/api";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const energyLevels = [1, 2, 3, 4, 5];

export default function PlanPage() {
  const { data: plan, isLoading } = useCurrentPlan();
  const updatePlan = useUpdatePlan();
  const { toast } = useToast();

  const [newPriority, setNewPriority] = useState("");
  const [newPriorityCategory, setNewPriorityCategory] = useState("");

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!plan) return null;

  const weekStart = new Date(plan.weekStart);
  const weekLabel = `Week of ${weekStart.toLocaleDateString("en-AU", { day: "numeric", month: "long" })}`;
  const priorities: WeeklyPlanPriority[] = plan.priorities || [];
  const intentions: WeeklyPlanIntention[] = plan.intentions || [];

  function handleSetEnergy(level: number) {
    updatePlan.mutate({
      id: plan!.id,
      data: { energyLevel: level },
    });
  }

  function handleToggleKidWeek() {
    updatePlan.mutate({
      id: plan!.id,
      data: { kidWeek: !plan!.kidWeek },
    });
  }

  function handleAddPriority() {
    if (!newPriority.trim()) return;
    const updated = [
      ...priorities,
      { title: newPriority.trim(), category: newPriorityCategory || undefined, status: "active" },
    ];
    updatePlan.mutate(
      { id: plan!.id, data: { priorities: updated } },
      {
        onSuccess: () => {
          setNewPriority("");
          setNewPriorityCategory("");
        },
      }
    );
  }

  function handleRemovePriority(index: number) {
    const updated = priorities.filter((_, i) => i !== index);
    updatePlan.mutate({ id: plan!.id, data: { priorities: updated } });
  }

  function handleUpdateIntention(day: string, focus: string) {
    const existing = intentions.find((i) => i.day === day);
    const updated = existing
      ? intentions.map((i) => (i.day === day ? { ...i, focus } : i))
      : [...intentions, { day, focus }];
    updatePlan.mutate({ id: plan!.id, data: { intentions: updated } });
  }

  function handleSaveReflection(reflection: string) {
    updatePlan.mutate(
      { id: plan!.id, data: { reflection } },
      { onSuccess: () => toast("Reflection saved") }
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Weekly Plan</h1>
        <p className="text-sm text-gray-500">{weekLabel}</p>
      </div>

      {/* Energy + Kid Week row */}
      <div className="flex gap-3">
        <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Energy Level</p>
          <div className="flex gap-1.5">
            {energyLevels.map((level) => (
              <button
                key={level}
                onClick={() => handleSetEnergy(level)}
                className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                  plan.energyLevel === level
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Kid Week</p>
          <button
            onClick={handleToggleKidWeek}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              plan.kidWeek
                ? "bg-pink-100 text-pink-700"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {plan.kidWeek ? "Kids \u2714" : "No Kids"}
          </button>
        </div>
      </div>

      {/* Priorities */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Priorities ({priorities.length})
        </h2>
        <div className="space-y-2">
          {priorities.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex-1">
                <PriorityCard title={p.title} category={p.category} status={p.status} />
              </div>
              <button
                onClick={() => handleRemovePriority(i)}
                className="text-gray-300 hover:text-red-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            placeholder="Add priority..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            onKeyDown={(e) => e.key === "Enter" && handleAddPriority()}
          />
          <select
            value={newPriorityCategory}
            onChange={(e) => setNewPriorityCategory(e.target.value)}
            className="px-2 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Category</option>
            <option value="health">Health</option>
            <option value="family">Family</option>
            <option value="career">Career</option>
            <option value="financial">Financial</option>
            <option value="creative">Creative</option>
            <option value="social">Social</option>
            <option value="learning">Learning</option>
          </select>
          <button
            onClick={handleAddPriority}
            disabled={!newPriority.trim()}
            className="px-3 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            Add
          </button>
        </div>
      </section>

      {/* Daily intentions */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Daily Focus
        </h2>
        <div className="space-y-2">
          {days.map((day) => {
            const intention = intentions.find((i) => i.day === day);
            return (
              <div key={day} className="flex items-center gap-3 bg-white rounded-lg border border-gray-100 px-3 py-2">
                <span className="text-xs font-medium text-gray-400 w-12">{day.slice(0, 3)}</span>
                <input
                  type="text"
                  defaultValue={intention?.focus || ""}
                  placeholder="What's the focus?"
                  className="flex-1 text-sm text-gray-700 bg-transparent focus:outline-none"
                  onBlur={(e) => {
                    if (e.target.value !== (intention?.focus || "")) {
                      handleUpdateIntention(day, e.target.value);
                    }
                  }}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Reflection */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Week Reflection
        </h2>
        <textarea
          defaultValue={plan.reflection || ""}
          placeholder="How did the week go? What would you change?"
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          onBlur={(e) => {
            if (e.target.value !== (plan.reflection || "")) {
              handleSaveReflection(e.target.value);
            }
          }}
        />
      </section>
    </div>
  );
}
