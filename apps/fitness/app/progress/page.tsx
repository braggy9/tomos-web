"use client";

import { useState } from "react";
import { useProgressSummary, useProgress, useRunningStats } from "../../hooks/useProgress";
import { useExercises } from "../../hooks/useFitness";
import { ProgressChart } from "../../components/ProgressChart";
import { AppSwitcher } from "../../components/AppSwitcher";
import { Spinner, Card } from "@tomos/ui";

export default function ProgressPage() {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const { data: summary, isLoading: summaryLoading } = useProgressSummary();
  const { data: exercises } = useExercises();
  const { data: progressData } = useProgress(selectedExercise);
  const { data: runningStats } = useRunningStats();

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Progress</h1>
        <AppSwitcher />
      </div>

      {summaryLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {summary && (
        <>
          {/* Summary stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card>
              <p className="text-2xl font-bold text-gray-900">{summary.totalSessions}</p>
              <p className="text-[10px] text-gray-400 uppercase">Total Sessions</p>
            </Card>
            <Card>
              <p className="text-2xl font-bold text-gray-900">{summary.weeklyRate}</p>
              <p className="text-[10px] text-gray-400 uppercase">Avg/Week (90d)</p>
            </Card>
            <Card>
              <p className="text-2xl font-bold text-gray-900">{summary.currentStreak}</p>
              <p className="text-[10px] text-gray-400 uppercase">Week Streak</p>
            </Card>
            <Card>
              <p className="text-2xl font-bold text-gray-900">{summary.personalRecords.length}</p>
              <p className="text-[10px] text-gray-400 uppercase">PRs Tracked</p>
            </Card>
          </div>

          {/* Personal Records */}
          {summary.personalRecords.length > 0 && (
            <Card className="mb-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Personal Records</p>
              <div className="space-y-2">
                {summary.personalRecords.map((pr, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{pr.exerciseName}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{pr.weight}kg</span>
                      <span className="text-xs text-gray-400">{pr.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      {/* Exercise selector + chart */}
      <div className="mb-4">
        <label className="text-xs text-gray-400 block mb-1">Select exercise</label>
        <select
          value={selectedExercise || ""}
          onChange={(e) => setSelectedExercise(e.target.value || null)}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
        >
          <option value="">Choose an exercise...</option>
          {exercises?.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
      </div>

      {progressData && <ProgressChart data={progressData} />}

      {/* Running stats */}
      {runningStats && (
        <Card className="mt-6">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Running Stats</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-gray-900">{runningStats.last7Days.totalDistance.toFixed(1)}km</p>
              <p className="text-[10px] text-gray-400">7-day distance</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{runningStats.last30Days.totalDistance.toFixed(1)}km</p>
              <p className="text-[10px] text-gray-400">30-day distance</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {runningStats.loadTrend === "increasing" ? "\u2191" :
                 runningStats.loadTrend === "decreasing" ? "\u2193" : "\u2192"}
              </p>
              <p className="text-[10px] text-gray-400">{runningStats.loadTrend}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
