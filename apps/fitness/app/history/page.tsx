"use client";

import { useState } from "react";
import Link from "next/link";
import { useSessions } from "../../hooks/useFitness";
import { useRunningActivities } from "../../hooks/useRunning";
import { Spinner } from "@tomos/ui";

const SESSION_NAMES: Record<string, string> = {
  A: "Strength + Power",
  B: "Upper + Core",
  C: "CrossFit Fun",
};

type HistoryFilter = "all" | "gym" | "running";

function formatPace(minPerKm: number | null): string {
  if (!minPerKm || minPerKm <= 0) return "—";
  const mins = Math.floor(minPerKm);
  const secs = Math.round((minPerKm - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function HistoryPage() {
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [gymOffset, setGymOffset] = useState(0);
  const [runOffset, setRunOffset] = useState(0);
  const limit = 20;

  const { data: gymData, isLoading: gymLoading } = useSessions({
    limit,
    offset: gymOffset,
  });
  const { data: runData, isLoading: runLoading } = useRunningActivities({
    days: 90,
    limit,
    offset: runOffset,
  });

  const isLoading =
    (filter === "gym" && gymLoading) ||
    (filter === "running" && runLoading) ||
    (filter === "all" && (gymLoading || runLoading));

  const sessions = gymData?.sessions || [];
  const activities = runData?.activities || [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">History</h1>

      {/* Filter toggle */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
        {(["all", "gym", "running"] as HistoryFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
              filter === f
                ? "bg-white text-brand-700 shadow-sm"
                : "text-gray-500"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      )}

      {/* Gym sessions */}
      {(filter === "all" || filter === "gym") && !gymLoading && (
        <div className="space-y-3">
          {filter === "all" && sessions.length > 0 && (
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Gym Sessions
            </h2>
          )}
          {sessions.map((session) => {
            const totalSets = session.sessionExercises.reduce(
              (sum, ex) => sum + ex.sets.length,
              0
            );
            const date = new Date(session.date);
            const dayName = date.toLocaleDateString("en-AU", {
              weekday: "short",
              timeZone: "Australia/Sydney",
            });
            const dateStr = date.toLocaleDateString("en-AU", {
              day: "numeric",
              month: "short",
              timeZone: "Australia/Sydney",
            });

            return (
              <div
                key={session.id}
                className="bg-white rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-sm">
                      Session {session.sessionType}
                    </span>
                    <span className="text-gray-400 text-sm ml-2">
                      {SESSION_NAMES[session.sessionType] || ""}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-600">
                      {dayName} {dateStr}
                    </p>
                    {session.weekType && (
                      <span className="text-[10px] text-gray-400">
                        {session.weekType === "kid" ? "Kid week" : "No kids"}
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-1">
                  {session.sessionExercises.map((se) => {
                    const topSet = se.sets.reduce(
                      (best, s) =>
                        (s.weight || 0) > (best.weight || 0) ? s : best,
                      se.sets[0]
                    );
                    return (
                      <div
                        key={se.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600">
                          {se.exercise.name}
                        </span>
                        <span className="text-gray-400 font-mono text-xs">
                          {topSet?.weight ? `${topSet.weight}kg` : "BW"} x{" "}
                          {topSet?.reps || "—"} ({se.sets.length} sets)
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100">
                  {session.overallRPE && (
                    <span className="text-xs text-gray-400">
                      RPE {session.overallRPE}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    {totalSets} total sets
                  </span>
                  {session.notes && (
                    <span className="text-xs text-gray-400 truncate flex-1 text-right">
                      {session.notes}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {gymData?.pagination?.hasMore && (
            <button
              onClick={() => setGymOffset((prev) => prev + limit)}
              className="w-full py-2 text-sm text-brand-600 font-medium hover:bg-brand-50 rounded-lg transition-colors"
            >
              Load more gym sessions
            </button>
          )}
        </div>
      )}

      {/* Running activities */}
      {(filter === "all" || filter === "running") && !runLoading && (
        <div className="space-y-3">
          {filter === "all" && activities.length > 0 && (
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              Running
            </h2>
          )}
          {activities.map((run) => {
            const date = new Date(run.date);
            const dayName = date.toLocaleDateString("en-AU", {
              weekday: "short",
              timeZone: "Australia/Sydney",
            });
            const dateStr = date.toLocaleDateString("en-AU", {
              day: "numeric",
              month: "short",
              timeZone: "Australia/Sydney",
            });

            return (
              <Link
                key={run.id}
                href={`/history/run/${run.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-brand-300 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {run.activityName || "Run"}
                    </span>
                    <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-brand-50 text-brand-700 capitalize">
                      {run.type}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-gray-600">
                    {dayName} {dateStr}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="font-mono text-xs">
                    {run.distance.toFixed(1)} km
                  </span>
                  <span className="font-mono text-xs">
                    {formatPace(run.avgPace)} /km
                  </span>
                  {run.avgHeartRate && (
                    <span className="font-mono text-xs">
                      {run.avgHeartRate} bpm
                    </span>
                  )}
                  <span className="font-mono text-xs">{run.duration}m</span>
                </div>
              </Link>
            );
          })}

          {runData?.pagination?.hasMore && (
            <button
              onClick={() => setRunOffset((prev) => prev + limit)}
              className="w-full py-2 text-sm text-brand-600 font-medium hover:bg-brand-50 rounded-lg transition-colors"
            >
              Load more runs
            </button>
          )}
        </div>
      )}

      {/* Empty state */}
      {!isLoading &&
        ((filter === "gym" && sessions.length === 0) ||
          (filter === "running" && activities.length === 0) ||
          (filter === "all" &&
            sessions.length === 0 &&
            activities.length === 0)) && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg font-medium">No history yet</p>
            <p className="text-sm mt-1">
              Log sessions from the Today tab
            </p>
          </div>
        )}
    </div>
  );
}
