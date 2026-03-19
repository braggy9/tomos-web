"use client";

import { useState } from "react";
import { useRaceLogistics, useParentingSchedule, useRefreshRaceData } from "../../hooks/useRaces";
import { RaceCalendarOverlay } from "../../components/RaceCalendarOverlay";
import { RaceDetailCard } from "../../components/RaceDetailCard";
import { CostTracker } from "../../components/CostTracker";

type Tab = "calendar" | "costs";

export default function RacesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("calendar");
  const [selectedRaceId, setSelectedRaceId] = useState<string | null>(null);
  const { data: raceData, isLoading } = useRaceLogistics();
  const { data: scheduleData } = useParentingSchedule();
  const refresh = useRefreshRaceData();

  const races = raceData?.races || [];
  const schedule = scheduleData?.weeks || [];
  const selectedRace = races.find((r) => r.id === selectedRaceId) || null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Race Ops</h1>
          <p className="text-xs text-gray-400">
            {races.filter((r) => r.entryStatus !== "dropped").length} active races
            {raceData?.lastFetched && (
              <> &middot; Updated {new Date(raceData.lastFetched).toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}</>
            )}
          </p>
        </div>
        <button
          onClick={() => refresh.mutate()}
          disabled={refresh.isPending}
          className="p-2 text-gray-400 hover:text-brand-600 transition-colors"
          title="Refresh from Notion"
        >
          <svg className={`w-5 h-5 ${refresh.isPending ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        {(["calendar", "costs"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setSelectedRaceId(null); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "calendar" ? "Calendar" : "Costs"}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : activeTab === "calendar" ? (
        <>
          {selectedRace ? (
            <RaceDetailCard
              race={selectedRace}
              onClose={() => setSelectedRaceId(null)}
            />
          ) : (
            <RaceCalendarOverlay
              races={races}
              schedule={schedule}
              onSelectRace={(id) => setSelectedRaceId(id)}
            />
          )}
        </>
      ) : (
        <CostTracker races={races} seasonCost={raceData?.seasonCost || null} />
      )}
    </div>
  );
}
