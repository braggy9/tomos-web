"use client";

import { useState, useEffect } from "react";
import { useTodayRun, useHRZones } from "../hooks/useRunning";
import { Spinner } from "@tomos/ui";
import type { WeekType } from "@tomos/api";
import { TrainingPlanCard } from "../components/TrainingPlanCard";
import { RunLogPanel, NoRunPanel } from "../components/RunLogPanel";
import { GymLogPanel } from "../components/GymLogPanel";

type Tab = "run" | "gym";

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

      {/* Run | Gym tab pills */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
        <button
          onClick={() => setActiveTab("run")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "run"
              ? "bg-white text-brand-700 shadow-sm"
              : "text-gray-500"
          }`}
        >
          Run
          {todayRun?.hasRun && (
            <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("gym")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === "gym"
              ? "bg-white text-brand-700 shadow-sm"
              : "text-gray-500"
          }`}
        >
          Gym
        </button>
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
      ) : (
        <GymLogPanel
          weekType={weekType}
          onWeekTypeChange={setWeekType}
        />
      )}
    </div>
  );
}
