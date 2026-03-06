"use client";

import { useCurrentWeek, useUpdateWeek, useUpdatePlannedSession } from "../hooks/useTraining";
import { useActivities } from "../hooks/useRunning";
import { useToast } from "@tomos/ui";
import type { PlannedSession, WeekType, Activity } from "@tomos/api";

const DAY_NAMES = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_STYLES: Record<string, { bg: string; icon: string }> = {
  planned: { bg: "bg-gray-100 border-gray-200", icon: "○" },
  completed: { bg: "bg-green-50 border-green-200", icon: "✓" },
  minimum_dose: { bg: "bg-green-50 border-green-200", icon: "✓" },
  skipped: { bg: "bg-gray-50 border-gray-100 opacity-60", icon: "—" },
  modified: { bg: "bg-amber-50 border-amber-200", icon: "~" },
};

const ACTIVITY_TYPE_BADGE: Record<string, { bg: string; label: string }> = {
  swim: { bg: "bg-cyan-100 text-cyan-700", label: "Swim" },
  mobility: { bg: "bg-green-100 text-green-700", label: "Mobility" },
  yoga: { bg: "bg-purple-100 text-purple-700", label: "Yoga" },
  "cross-train": { bg: "bg-orange-100 text-orange-700", label: "X-train" },
  walk: { bg: "bg-amber-100 text-amber-700", label: "Walk" },
  workout: { bg: "bg-pink-100 text-pink-700", label: "Workout" },
};

const SESSION_TYPE_COLOR: Record<string, string> = {
  easy: "text-blue-600",
  long: "text-blue-700 font-semibold",
  tempo: "text-orange-600",
  intervals: "text-red-600",
  hills: "text-amber-700",
  progressive: "text-violet-600",
  bft: "text-emerald-600",
  metcon: "text-pink-600",
  rest: "text-gray-400",
  ocean: "text-cyan-600",
};

function SessionRow({
  session,
  isToday,
  onStatusChange,
}: {
  session: PlannedSession;
  isToday: boolean;
  onStatusChange: (id: string, status: string) => void;
}) {
  const style = STATUS_STYLES[session.status] || STATUS_STYLES.planned;
  const typeColor = SESSION_TYPE_COLOR[session.sessionType] || "text-gray-600";

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border ${style.bg} ${
        isToday ? "ring-2 ring-brand-300 ring-offset-1" : ""
      }`}
    >
      {/* Day */}
      <div className="w-10 text-center">
        <span className={`text-xs font-bold ${isToday ? "text-brand-600" : "text-gray-500"}`}>
          {DAY_NAMES[session.dayOfWeek]}
        </span>
      </div>

      {/* Status indicator */}
      <button
        onClick={() => {
          if (session.status === "planned") {
            onStatusChange(session.id, "completed");
          } else if (session.status === "completed") {
            onStatusChange(session.id, "planned");
          }
        }}
        className={`flex items-center justify-center w-7 h-7 rounded-full border-2 text-xs font-bold transition-colors ${
          session.status === "completed" || session.status === "minimum_dose"
            ? "bg-green-500 border-green-500 text-white"
            : session.status === "skipped"
            ? "bg-gray-200 border-gray-200 text-gray-400"
            : "border-gray-300 text-gray-400 hover:border-brand-400"
        }`}
      >
        {style.icon}
      </button>

      {/* Session info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${typeColor}`}>
            {session.sessionName || session.sessionType}
          </span>
          {session.isOptional && (
            <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              optional
            </span>
          )}
          {session.isNonKidOnly && (
            <span className="text-[10px] text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded">
              non-kid
            </span>
          )}
        </div>
        {(session.targetDistanceKm || session.targetPaceZone) && (
          <p className="text-xs text-gray-400">
            {session.targetDistanceKm ? `${session.targetDistanceKm}km` : ""}
            {session.targetDistanceKm && session.targetPaceZone ? " · " : ""}
            {session.targetPaceZone ? `${session.targetPaceZone} pace` : ""}
          </p>
        )}
      </div>

      {/* Linked indicator */}
      {(session.linkedRun || session.linkedGymSession) && (
        <span className="text-xs text-green-600">linked</span>
      )}
    </div>
  );
}

export function WeekView() {
  const toast = useToast().toast;
  const { data: week, isLoading } = useCurrentWeek();
  const { data: activityData } = useActivities({ days: 7 });
  const updateWeek = useUpdateWeek();
  const updateSession = useUpdatePlannedSession();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!week) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No active training week</p>
        <p className="text-xs text-gray-400 mt-1">
          Start a training plan to see your weekly schedule here.
        </p>
      </div>
    );
  }

  const today = new Date();
  const todayDayOfWeek = today.getDay() === 0 ? 7 : today.getDay();

  // Group activities by day of week
  const activitiesByDay: Record<number, Activity[]> = {};
  for (const a of activityData?.activities || []) {
    const d = new Date(a.date);
    const dow = d.getDay() === 0 ? 7 : d.getDay();
    if (!activitiesByDay[dow]) activitiesByDay[dow] = [];
    activitiesByDay[dow].push(a);
  }

  // Filter sessions based on week type
  const filteredSessions = (week.sessions || []).filter((s) => {
    if (week.weekType === "kid") return !s.isNonKidOnly;
    if (week.weekType === "non-kid") return !s.isKidWeekOnly;
    return true;
  });

  const handleStatusChange = async (sessionId: string, status: string) => {
    try {
      await updateSession.mutateAsync({ id: sessionId, data: { status } });
      toast(status === "completed" ? "Session completed" : "Session reset");
    } catch {
      toast("Failed to update session", "error");
    }
  };

  const handleWeekTypeChange = async (weekType: string) => {
    try {
      await updateWeek.mutateAsync({ id: week.id, data: { weekType } });
      toast(`Set to ${weekType === "kid" ? "kid" : "non-kid"} week`);
    } catch {
      toast("Failed to update week type", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">
            Week {week.weekNumber}
            {week.block && (
              <span className="text-sm font-normal text-gray-400 ml-2">
                {week.block.name}
              </span>
            )}
          </h2>
          {week.keyFocus && (
            <p className="text-xs text-gray-500 mt-0.5">{week.keyFocus}</p>
          )}
        </div>
        {/* Week type toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {(["non-kid", "kid"] as WeekType[]).map((wt) => (
            <button
              key={wt}
              onClick={() => handleWeekTypeChange(wt)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                week.weekType === wt
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              {wt === "kid" ? "Kid" : "No Kids"}
            </button>
          ))}
        </div>
      </div>

      {/* Km progress */}
      {week.weekProgress && week.weekProgress.targetKm && (
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>{week.weekProgress.completed}/{week.weekProgress.planned} sessions</span>
            <span>
              {week.weekProgress.actualKm ?? 0} / {week.weekProgress.targetKm}km
            </span>
          </div>
          <div className="bg-gray-100 rounded-full h-2">
            <div
              className="bg-brand-500 rounded-full h-2 transition-all"
              style={{
                width: `${
                  week.weekProgress.targetKm > 0
                    ? Math.min(
                        100,
                        ((week.weekProgress.actualKm ?? 0) / week.weekProgress.targetKm) * 100
                      )
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Session rows */}
      <div className="space-y-2">
        {filteredSessions.map((session) => (
          <div key={session.id}>
            <SessionRow
              session={session}
              isToday={session.dayOfWeek === todayDayOfWeek}
              onStatusChange={handleStatusChange}
            />
            {/* Activities for this day */}
            {activitiesByDay[session.dayOfWeek]?.map((a) => {
              const badge = ACTIVITY_TYPE_BADGE[a.activityType] || {
                bg: "bg-gray-100 text-gray-700",
                label: a.activityType,
              };
              return (
                <div
                  key={a.id}
                  className="ml-[4.75rem] mt-1 flex items-center gap-2 text-xs text-gray-500"
                >
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.bg}`}>
                    {badge.label}
                  </span>
                  <span>{a.duration}m</span>
                  {a.distance && <span>{a.distance.toFixed(1)}km</span>}
                  {a.activityName && (
                    <span className="truncate text-gray-400">
                      {a.activityName}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
