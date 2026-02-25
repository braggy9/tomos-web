"use client";

import { useState } from "react";
import { useDailyPlan } from "../hooks/useFitness";
import { SuggestionCard } from "../components/SuggestionCard";
import { RecoveryCheckin } from "../components/RecoveryCheckin";
import { RunningLoadCard } from "../components/RunningLoadCard";
import { NutritionNudge } from "../components/NutritionNudge";
import { WeekTypeToggle } from "../components/WeekTypeToggle";
import { AppSwitcher } from "../components/AppSwitcher";
import { Spinner } from "@tomos/ui";
import type { FitnessWeekType } from "@tomos/api";

export default function TodayPage() {
  const [weekType, setWeekType] = useState<FitnessWeekType>("non-kid");
  const { data: plan, isLoading, error } = useDailyPlan(weekType);

  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Good morning"
      : today.getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{greeting}, Tom</p>
          <h1 className="text-xl font-bold text-gray-900">FitnessOS</h1>
        </div>
        <div className="flex items-center gap-3">
          <WeekTypeToggle value={weekType} onChange={setWeekType} />
          <AppSwitcher />
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          Failed to load daily plan. {error instanceof Error ? error.message : ""}
        </div>
      )}

      {plan && (
        <div className="space-y-4">
          {/* Hero: What to do today */}
          <SuggestionCard plan={plan} />

          {/* Recovery check-in */}
          <RecoveryCheckin />

          {/* Running load */}
          <RunningLoadCard context={plan.runningContext} />

          {/* Nutrition nudge */}
          <NutritionNudge nudge={plan.nutritionNudge} />

          {/* Last session summary */}
          {plan.suggestion?.lastSession && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
              <span className="text-xs text-gray-400">Last session:</span>
              <span className="text-xs font-medium text-gray-600">
                Session {plan.suggestion.lastSession.type} — {plan.suggestion.lastSession.date}
                ({plan.suggestion.lastSession.daysAgo} day{plan.suggestion.lastSession.daysAgo === 1 ? "" : "s"} ago)
              </span>
            </div>
          )}

          {/* Frequency stats */}
          {plan.suggestion?.frequency && (
            <div className="flex gap-4 text-center">
              <div className="flex-1 bg-white rounded-xl border border-gray-200 p-3">
                <p className="text-lg font-bold text-gray-900">{plan.suggestion.frequency.thisWeek}</p>
                <p className="text-[10px] text-gray-400">This week</p>
              </div>
              <div className="flex-1 bg-white rounded-xl border border-gray-200 p-3">
                <p className="text-lg font-bold text-gray-900">{plan.suggestion.frequency.thisMonth}</p>
                <p className="text-[10px] text-gray-400">This month</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
