"use client";

import { useState, useMemo } from "react";
import { useCoachWeek } from "../../hooks/useRunning";
import type { CoachWeekDay } from "@tomos/api";

// ─── Training Phases (hardcoded from living doc) ────────────

const TRAINING_PHASES = [
  { name: "Rebuild", start: "2026-03-01", end: "2026-04-10", target: "Jabulani 22km", phase: "rebuild" },
  { name: "Base Building", start: "2026-04-11", end: "2026-05-31", target: "UTA 22km", phase: "base" },
  { name: "Marathon Specific", start: "2026-06-01", end: "2026-07-04", target: "GC Marathon", phase: "specific" },
  { name: "Recovery + Transition", start: "2026-07-06", end: "2026-07-20", target: null, phase: "recovery" },
  { name: "Sydney Marathon Block", start: "2026-07-21", end: "2026-08-29", target: "Sydney Marathon", phase: "specific" },
  { name: "Trail Pivot", start: "2026-09-01", end: "2026-10-31", target: "Hounslow 17km", phase: "build" },
  { name: "Kosi Peak", start: "2026-10-15", end: "2026-11-27", target: "Kosi 50km", phase: "build" },
];

// ─── Races ──────────────────────────────────────────────────

const RACES = [
  { name: "Jabulani 22km", date: "2026-04-11" },
  { name: "UTA 22km", date: "2026-05-15" },
  { name: "GC Marathon", date: "2026-07-05" },
  { name: "Sunny Coast", date: "2026-08-02" },
  { name: "Sydney Marathon", date: "2026-08-30" },
  { name: "Hounslow 17km", date: "2026-09-12" },
  { name: "Kosi 50km", date: "2026-11-27" },
];

// ─── Social Runs (recurring) ────────────────────────────────

const SOCIAL_RUNS: { name: string; dayOfWeek: number; time: string }[] = [
  { name: "Pace", dayOfWeek: 1, time: "6pm" },
  { name: "CRC", dayOfWeek: 2, time: "6:30pm" },
  { name: "CRC", dayOfWeek: 3, time: "6:30am" },
  { name: "CRC", dayOfWeek: 4, time: "6:15am" },
  { name: "parkrun", dayOfWeek: 6, time: "7am" },
  { name: "CRC", dayOfWeek: 7, time: "8am" },
];

// ─── Styling ────────────────────────────────────────────────

const PHASE_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  rebuild: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  base: { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  build: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  specific: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  recovery: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" },
};

const SESSION_TYPE_COLOR: Record<string, string> = {
  easy: "bg-blue-100 text-blue-700",
  long: "bg-blue-200 text-blue-800",
  tempo: "bg-orange-100 text-orange-700",
  intervals: "bg-red-100 text-red-700",
  hills: "bg-amber-100 text-amber-800",
  progressive: "bg-violet-100 text-violet-700",
  rest: "bg-gray-100 text-gray-500",
  gym: "bg-emerald-100 text-emerald-700",
  "cross-train": "bg-cyan-100 text-cyan-700",
  ocean: "bg-cyan-100 text-cyan-700",
};

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ─── Helpers ────────────────────────────────────────────────

function getCurrentPhase(mondayStr: string) {
  const monday = new Date(mondayStr);
  return TRAINING_PHASES.find((p) => {
    const start = new Date(p.start);
    const end = new Date(p.end);
    return monday >= start && monday <= end;
  });
}

function getWeeksUntil(targetDate: string, fromDate: string): number {
  const diff = new Date(targetDate).getTime() - new Date(fromDate).getTime();
  return Math.max(0, Math.ceil(diff / (7 * 86400000)));
}

function isDeloadWeek(mondayStr: string, phaseStart: string): boolean {
  const diff = new Date(mondayStr).getTime() - new Date(phaseStart).getTime();
  const weekNum = Math.floor(diff / (7 * 86400000)) + 1;
  return weekNum % 4 === 0;
}

function getRaceForDate(date: string) {
  return RACES.find((r) => r.date === date);
}

function getSocialRunsForDay(dayOfWeek: number) {
  return SOCIAL_RUNS.filter((s) => s.dayOfWeek === dayOfWeek);
}

function getTodayStr(): string {
  // Approximate Sydney date — good enough for highlighting
  const now = new Date();
  const sydney = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
  return `${sydney.getFullYear()}-${String(sydney.getMonth() + 1).padStart(2, "0")}-${String(sydney.getDate()).padStart(2, "0")}`;
}

// ─── Components ─────────────────────────────────────────────

function PhaseHeader({ monday }: { monday: string }) {
  const phase = getCurrentPhase(monday);
  if (!phase) return null;

  const style = PHASE_STYLE[phase.phase] || PHASE_STYLE.rebuild;
  const deload = isDeloadWeek(monday, phase.start);
  const weeksLeft = phase.target ? getWeeksUntil(phase.target === "Jabulani 22km" ? "2026-04-11" :
    phase.target === "UTA 22km" ? "2026-05-15" :
    phase.target === "GC Marathon" ? "2026-07-05" :
    phase.target === "Sydney Marathon" ? "2026-08-30" :
    phase.target === "Hounslow 17km" ? "2026-09-12" :
    phase.target === "Kosi 50km" ? "2026-11-27" : monday, monday) : null;

  return (
    <div className={`${style.bg} ${style.border} border rounded-xl p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-lg font-bold ${style.text}`}>
            {phase.name}
            {deload && (
              <span className="ml-2 text-xs font-medium bg-white/60 px-2 py-0.5 rounded-full">
                Deload
              </span>
            )}
          </h2>
          {phase.target && (
            <p className={`text-sm ${style.text} opacity-75`}>
              {weeksLeft != null && weeksLeft > 0
                ? `${weeksLeft} week${weeksLeft === 1 ? "" : "s"} to ${phase.target}`
                : `Target: ${phase.target}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DayCard({ day, isToday }: { day: CoachWeekDay; isToday: boolean }) {
  const race = getRaceForDate(day.date);
  const socialRuns = getSocialRunsForDay(day.dayOfWeek);
  const hasContent = day.prescription || day.completedRuns.length > 0 || day.completedGym.length > 0 || (day.completedActivities?.length ?? 0) > 0 || race;

  return (
    <div
      className={`rounded-xl border p-3 space-y-2 ${
        isToday
          ? "border-brand-300 bg-brand-50/30 ring-2 ring-brand-200 ring-offset-1"
          : "border-gray-200 bg-white"
      }`}
    >
      {/* Day header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${isToday ? "text-brand-600" : "text-gray-500"}`}>
            {DAY_NAMES[day.dayOfWeek - 1]}
          </span>
          <span className="text-xs text-gray-400">
            {new Date(day.date + "T12:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
          </span>
        </div>
        {race && (
          <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
            {race.name}
          </span>
        )}
      </div>

      {/* Coach prescription (primary) */}
      {day.prescription && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                SESSION_TYPE_COLOR[day.prescription.sessionType] || "bg-gray-100 text-gray-600"
              }`}
            >
              {day.prescription.sessionType}
            </span>
            {day.prescription.targetDistanceKm && (
              <span className="text-xs text-gray-500">
                {day.prescription.targetDistanceKm}km
              </span>
            )}
            {day.prescription.targetHRZone && (
              <span className="text-[10px] text-violet-600 font-medium">
                {day.prescription.targetHRZone}
              </span>
            )}
          </div>
          {day.prescription.notes && (
            <p className="text-[11px] text-gray-500 line-clamp-2">
              {day.prescription.notes}
            </p>
          )}
        </div>
      )}

      {/* Completed runs overlay */}
      {day.completedRuns.map((run) => (
        <div
          key={run.id}
          className="flex items-center gap-2 bg-green-50 rounded-lg px-2 py-1.5"
        >
          <span className="text-green-600 text-xs font-bold">
            {Math.round(run.distance * 10) / 10}km
          </span>
          {run.avgPace && (
            <span className="text-[10px] text-green-500">
              {run.avgPace.toFixed(1)}/km
            </span>
          )}
          {run.avgHeartRate && (
            <span className="text-[10px] text-green-500">
              {run.avgHeartRate}bpm
            </span>
          )}
        </div>
      ))}

      {/* Completed gym overlay */}
      {day.completedGym.map((gym) => (
        <div
          key={gym.id}
          className="flex items-center gap-2 bg-emerald-50 rounded-lg px-2 py-1.5"
        >
          <span className="text-emerald-600 text-xs font-bold">
            Gym {gym.sessionType}
          </span>
          {gym.rpe && (
            <span className="text-[10px] text-emerald-500">
              RPE {gym.rpe}
            </span>
          )}
        </div>
      ))}

      {/* Completed activities overlay */}
      {day.completedActivities?.map((act) => {
        const actColors: Record<string, string> = {
          swim: "bg-cyan-50 text-cyan-600",
          mobility: "bg-green-50 text-green-600",
          yoga: "bg-purple-50 text-purple-600",
          "cross-train": "bg-orange-50 text-orange-600",
          walk: "bg-amber-50 text-amber-600",
          workout: "bg-pink-50 text-pink-600",
        };
        return (
          <div
            key={act.id}
            className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${actColors[act.activityType] || "bg-gray-50 text-gray-600"}`}
          >
            <span className="text-xs font-bold capitalize">
              {act.activityType}
            </span>
            <span className="text-[10px]">{act.duration}m</span>
            {act.distance && (
              <span className="text-[10px]">{act.distance.toFixed(1)}km</span>
            )}
          </div>
        );
      })}

      {/* Social runs (faded) */}
      {socialRuns.length > 0 && !race && (
        <div className="flex flex-wrap gap-1">
          {socialRuns.map((s) => (
            <span
              key={s.name + s.dayOfWeek}
              className="text-[9px] text-gray-300 bg-gray-50 px-1.5 py-0.5 rounded"
            >
              {s.name} {s.time}
            </span>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!hasContent && socialRuns.length === 0 && (
        <p className="text-[10px] text-gray-300 italic">No prescription</p>
      )}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────

export default function PlanPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const { data: week, isLoading } = useCoachWeek(weekOffset);
  const todayStr = useMemo(getTodayStr, []);

  return (
    <div className="space-y-4">
      {/* Phase header */}
      {week && <PhaseHeader monday={week.monday} />}

      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset((w) => w - 1)}
          className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          {week ? (
            <>
              <button
                onClick={() => setWeekOffset(0)}
                className={`text-sm font-semibold ${weekOffset === 0 ? "text-brand-600" : "text-gray-900 hover:text-brand-600"}`}
              >
                {weekOffset === 0
                  ? "This Week"
                  : weekOffset === -1
                  ? "Last Week"
                  : weekOffset === 1
                  ? "Next Week"
                  : `Week of ${new Date(week.monday + "T12:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short" })}`}
              </button>
              <p className="text-xs text-gray-400">
                {new Date(week.monday + "T12:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                {" — "}
                {new Date(week.sunday + "T12:00:00").toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
              </p>
            </>
          ) : (
            <span className="text-sm text-gray-400">Loading...</span>
          )}
        </div>
        <button
          onClick={() => setWeekOffset((w) => w + 1)}
          className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day cards */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : week ? (
        <div className="space-y-2">
          {week.days.map((day) => (
            <DayCard
              key={day.date}
              day={day}
              isToday={day.date === todayStr}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <p className="text-sm">No data available</p>
        </div>
      )}
    </div>
  );
}
