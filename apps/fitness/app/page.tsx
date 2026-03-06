"use client";

import { useState, useEffect } from "react";
import { useTodayRun, useHRZones } from "../hooks/useRunning";
import { Spinner } from "@tomos/ui";
import type { WeekType } from "@tomos/api";
import { TrainingPlanCard } from "../components/TrainingPlanCard";
import { RunLogPanel, NoRunPanel } from "../components/RunLogPanel";
import { GymLogPanel } from "../components/GymLogPanel";
import { ActivityLogPanel } from "../components/ActivityLogPanel";

type Tab = "run" | "gym" | "log";

export default function TodayPage() {
  const [weekType, setWeekType] = useState<WeekType>("non-kid");
  const [activeTab, setActiveTab] = useState<Tab>("gym");
  const { data: todayRun, isLoading: runLoading } = useTodayRun();
  const { data: zonesData } = useHRZones(
    todayRun?.hasRun ? todayRun.run?.id : undefined
  );

  // Auto-select Run tab when Strava run exists today
  useEffect(() => {
    if (todayRun?.hasRun) {
      setActiveTab("run");
    }
  }, [todayRun?.hasRun]);

  if (runLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Today</h1>
        {/* Week type toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {(["non-kid", "kid"] as WeekType[]).map((wt) => (
            <button
              key={wt}
              onClick={() => setWeekType(wt)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                weekType === wt
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              {wt === "kid" ? "Kid Week" : "No Kids"}
            </button>
          ))}
        </div>
      </div>

      {/* Training plan card */}
      <TrainingPlanCard />

      {/* Run | Gym | Log tab pills */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
        {(["run", "gym", "log"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab
                ? "bg-white text-brand-700 shadow-sm"
                : "text-gray-500"
            }`}
          >
            {tab === "run" ? "Run" : tab === "gym" ? "Gym" : "Log"}
            {tab === "run" && todayRun?.hasRun && (
              <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "run" ? (
        todayRun?.hasRun && todayRun.run ? (
          <RunLogPanel
            run={todayRun.run}
            hrZones={zonesData?.zoneTime}
          />
        ) : (
          <NoRunPanel />
        )
      ) : activeTab === "gym" ? (
        <GymLogPanel
          weekType={weekType}
          onWeekTypeChange={setWeekType}
        />
      ) : (
        <ActivityLogPanel />
      )}
    </div>
  );
}
