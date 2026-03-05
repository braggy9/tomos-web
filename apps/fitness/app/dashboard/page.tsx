"use client";

import { useWeeklyDashboard } from "../../hooks/useDashboard";
import { Spinner } from "@tomos/ui";

const ACWR_COLORS = {
  green: "text-green-600 bg-green-50",
  amber: "text-amber-600 bg-amber-50",
  red: "text-red-600 bg-red-50",
};

function formatPace(minPerKm: number): string {
  if (!minPerKm || minPerKm <= 0) return "—";
  const mins = Math.floor(minPerKm);
  const secs = Math.round((minPerKm - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")} /km`;
}

export default function DashboardPage() {
  const { data: dashboard, isLoading } = useWeeklyDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="py-8 text-center text-gray-400">
        No data available
      </div>
    );
  }

  const periodStart = new Date(dashboard.period.start);
  const periodEnd = new Date(dashboard.period.end);
  const periodLabel = `${periodStart.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Australia/Sydney",
  })} – ${periodEnd.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Australia/Sydney",
  })}`;

  const maxLoad = Math.max(
    ...dashboard.trainingLoad.dailyLoads.map((d) => d.runningLoad),
    1
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-500">{periodLabel}</p>
      </div>

      {/* Running card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Running
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat
            label="Total"
            value={`${dashboard.running.totalKm} km`}
            accent
          />
          <Stat label="Sessions" value={String(dashboard.running.sessions)} />
          <Stat label="Avg Pace" value={formatPace(dashboard.running.avgPace)} />
          <Stat
            label="Longest"
            value={`${dashboard.running.longestRun} km`}
          />
        </div>
      </div>

      {/* Gym card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Gym
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Sessions" value={String(dashboard.gym.sessions)} />
          <Stat
            label="Avg RPE"
            value={dashboard.gym.avgRPE?.toString() ?? "—"}
          />
          <Stat label="Total Sets" value={String(dashboard.gym.totalSets)} />
        </div>
      </div>

      {/* Training load bar chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Training Load
          </h2>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              ACWR_COLORS[dashboard.trainingLoad.acwrStatus]
            }`}
          >
            ACWR {dashboard.trainingLoad.acwr}
          </span>
        </div>
        <div className="flex items-end gap-1 h-24">
          {dashboard.trainingLoad.dailyLoads.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center" style={{ height: "80px" }}>
                {d.runningLoad > 0 ? (
                  <div
                    className="w-full max-w-6 bg-brand-500 rounded-t"
                    style={{
                      height: `${Math.max((d.runningLoad / maxLoad) * 80, 4)}px`,
                    }}
                  />
                ) : d.gymSessions > 0 ? (
                  <div className="w-full max-w-6 bg-gray-300 rounded-t h-3" />
                ) : (
                  <div className="w-full max-w-6 bg-gray-100 rounded-t h-1" />
                )}
              </div>
              <span className="text-[10px] text-gray-400">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recovery trend */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Recovery
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Stat
            label="Avg Readiness"
            value={
              dashboard.recovery.avgReadiness
                ? `${dashboard.recovery.avgReadiness}/5`
                : "—"
            }
          />
          <Stat
            label="Check-ins"
            value={`${dashboard.recovery.checkins}/7`}
          />
        </div>
      </div>

      {/* Plan compliance */}
      {dashboard.planCompliance && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Plan Compliance
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div
                className="bg-brand-600 rounded-full h-3 transition-all"
                style={{
                  width: `${dashboard.planCompliance.percentage}%`,
                }}
              />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {dashboard.planCompliance.completed}/
              {dashboard.planCompliance.planned}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase text-gray-400 font-medium">
        {label}
      </p>
      <p
        className={`text-lg font-bold ${accent ? "text-brand-600" : "text-gray-900"}`}
      >
        {value}
      </p>
    </div>
  );
}
