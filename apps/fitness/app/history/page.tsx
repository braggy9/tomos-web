"use client";

import { useState } from "react";
import { useSessions } from "../../hooks/useFitness";
import { Spinner } from "@tomos/ui";

const SESSION_NAMES: Record<string, string> = {
  A: "Strength + Power",
  B: "Upper + Core",
  C: "CrossFit Fun",
};

export default function HistoryPage() {
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const { data, isLoading } = useSessions({ limit, offset });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const sessions = data?.sessions || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Session History</h1>

      {sessions.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg font-medium">No sessions yet</p>
          <p className="text-sm mt-1">
            Log your first session from the Today tab
          </p>
        </div>
      )}

      <div className="space-y-3">
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

              {/* Exercise summary */}
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

              {/* Footer */}
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
      </div>

      {/* Pagination */}
      {pagination && pagination.hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setOffset((prev) => prev + limit)}
            className="px-4 py-2 text-sm text-brand-600 font-medium hover:bg-brand-50 rounded-lg transition-colors"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
