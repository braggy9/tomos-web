"use client";

import { useSessions, useRunningStats } from "../../hooks/useFitness";
import { Spinner } from "@tomos/ui";

export default function ProgressPage() {
  const { data: sessionsData, isLoading: sessionsLoading } = useSessions({
    limit: 50,
  });
  const { data: running, isLoading: runningLoading } = useRunningStats();

  if (sessionsLoading || runningLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const sessions = sessionsData?.sessions || [];

  // Extract exercise progress data
  const exerciseProgress: Record<
    string,
    { name: string; history: { date: string; weight: number; rpe: number }[] }
  > = {};

  for (const session of sessions) {
    for (const se of session.sessionExercises) {
      const topSet = se.sets.reduce(
        (best, s) =>
          (s.weight || 0) > (best.weight || 0) ? s : best,
        se.sets[0]
      );
      if (!topSet || !topSet.weight) continue;

      if (!exerciseProgress[se.exercise.id]) {
        exerciseProgress[se.exercise.id] = {
          name: se.exercise.name,
          history: [],
        };
      }
      exerciseProgress[se.exercise.id].history.push({
        date: session.date,
        weight: topSet.weight,
        rpe: topSet.rpe || 7,
      });
    }
  }

  // Sort by most recent, get top exercises
  const topExercises = Object.values(exerciseProgress)
    .filter((e) => e.history.length >= 2)
    .sort((a, b) => b.history.length - a.history.length)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Progress</h1>

      {/* Running stats */}
      {running && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Running
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="7-Day Distance"
              value={`${running.last7Days.totalDistance}km`}
            />
            <StatCard
              label="7-Day Sessions"
              value={String(running.last7Days.sessions)}
            />
            <StatCard
              label="Load Trend"
              value={running.loadTrend}
              color={
                running.loadTrend === "increasing"
                  ? "text-green-600"
                  : running.loadTrend === "decreasing"
                    ? "text-amber-600"
                    : "text-gray-600"
              }
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-100">
            <StatCard
              label="30-Day Distance"
              value={`${running.last30Days.totalDistance}km`}
            />
            <StatCard
              label="30-Day Sessions"
              value={String(running.last30Days.sessions)}
            />
            <StatCard
              label="30-Day Load"
              value={String(running.last30Days.trainingLoad)}
            />
          </div>
        </div>
      )}

      {/* Gym stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Gym — {sessions.length} sessions
        </h2>

        {sessions.length === 0 ? (
          <p className="text-sm text-gray-400">
            No sessions logged yet. Start from the Today tab.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="Total Sessions"
              value={String(sessions.length)}
            />
            <StatCard
              label="Avg RPE"
              value={(
                sessions
                  .filter((s) => s.overallRPE)
                  .reduce((sum, s) => sum + (s.overallRPE || 0), 0) /
                  (sessions.filter((s) => s.overallRPE).length || 1)
              ).toFixed(1)}
            />
            <StatCard
              label="Total Sets"
              value={String(
                sessions.reduce(
                  (sum, s) =>
                    sum +
                    s.sessionExercises.reduce(
                      (sum2, se) => sum2 + se.sets.length,
                      0
                    ),
                  0
                )
              )}
            />
          </div>
        )}
      </div>

      {/* Exercise progress (simple bar visualization) */}
      {topExercises.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Lift Progress
          </h2>
          <div className="space-y-4">
            {topExercises.map((ex) => {
              const sorted = [...ex.history].sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              );
              const first = sorted[0].weight;
              const latest = sorted[sorted.length - 1].weight;
              const change = latest - first;
              const maxWeight = Math.max(...sorted.map((h) => h.weight));

              return (
                <div key={ex.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{ex.name}</span>
                    <span className="text-xs text-gray-500">
                      {latest}kg{" "}
                      <span
                        className={
                          change > 0
                            ? "text-green-600"
                            : change < 0
                              ? "text-red-500"
                              : "text-gray-400"
                        }
                      >
                        ({change > 0 ? "+" : ""}
                        {change}kg)
                      </span>
                    </span>
                  </div>
                  {/* Simple bar chart */}
                  <div className="flex items-end gap-0.5 h-8">
                    {sorted.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-brand-200 rounded-t-sm"
                        style={{
                          height: `${maxWeight > 0 ? (h.weight / maxWeight) * 100 : 0}%`,
                          minHeight: "4px",
                        }}
                        title={`${new Date(h.date).toLocaleDateString("en-AU", { timeZone: "Australia/Sydney" })}: ${h.weight}kg`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <p className="text-[10px] text-gray-400 uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-lg font-bold ${color || "text-gray-900"}`}>
        {value}
      </p>
    </div>
  );
}
